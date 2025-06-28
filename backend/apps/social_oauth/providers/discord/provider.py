# social_oauth/providers/discord/provider.py

import logging
from typing import Any

import aiohttp
from adjango.utils.funcs import set_image_by_url
from django.conf import settings

from apps.core.models import User
from apps.core.services.auth import new_jwt_for_user, JWTPair
from apps.social_oauth.exceptions.base import SocialOAuthException
from apps.social_oauth.models import DiscordUser
from apps.social_oauth.oauth_provider import OAuthProvider

log = logging.getLogger('social_auth')


class DiscordOAuthProvider(OAuthProvider):
    @staticmethod
    async def link_user_account(user, user_data):
        discord_id = user_data['id']
        existing_link = await DiscordUser.objects.select_related('user').filter(discord_id=discord_id).afirst()
        if existing_link and existing_link.user != user:
            raise SocialOAuthException.AccountAlreadyLinkedAnotherUser()
        discord_user, _ = await DiscordUser.objects.aget_or_create(user=user)
        discord_user.discord_id = discord_id
        # Обновляем другие поля при необходимости
        await discord_user.asave()

    async def get_user_data(self, code: str) -> dict[str, Any]:
        """
        Получает данные пользователя по Discord API.

        @param code: Код авторизации, полученный от Discord OAuth2.
        @return: Словарь с данными пользователя.
        """
        async with aiohttp.ClientSession() as session:
            # Получение access_token
            async with session.post(
                    url='https://discord.com/api/v10/oauth2/token',
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    data={
                        'grant_type': 'authorization_code',
                        'code': code,
                        'redirect_uri': settings.DISCORD_REDIRECT_URI
                    },
                    auth=aiohttp.BasicAuth(settings.DISCORD_CLIENT_ID, settings.DISCORD_CLIENT_SECRET)
            ) as resp:
                resp.raise_for_status()
                response_data = await resp.json()
                log.info(f'Discord response data:\n{response_data}')
                access_token = response_data['access_token']

            # Получение информации о пользователе
            async with session.get('https://discord.com/api/v10/users/@me', headers={
                'Authorization': f'Bearer {access_token}',
            }) as user_resp:
                user_resp.raise_for_status()
                user_data = await user_resp.json()
                log.info(f'Discord user data:\n{user_data}')

        return user_data

    async def get_or_create_user(self, user_data: dict[str, Any]) -> User:
        discord_id = user_data.get('id')
        if not discord_id: raise SocialOAuthException.DiscordIDNotProvided()
        try:
            discord_user = await DiscordUser.objects.select_related('user').aget(discord_id=discord_id)
            user = discord_user.user
        except DiscordUser.DoesNotExist:
            try:
                user = await User.objects.aget(email=user_data.get('email'))
            except User.DoesNotExist:
                email = user_data.get('email', '')
                username = user_data.get('username', '') or f'discord_{discord_id}'
                discriminator = user_data.get('discriminator', '')
                full_username = f'{username}#{discriminator}' if discriminator else username
                user = await User.objects.acreate(
                    email=email,
                    username=full_username,
                    is_email_confirmed=bool(email),
                )
                avatar_hash = user_data.get('avatar')
                # TODO: сделать правильное получение фото
                if avatar_hash:
                    avatar_url = f'https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png'
                    await set_image_by_url(user, 'avatar', avatar_url)
            await DiscordUser.objects.acreate(user=user, discord_id=discord_id, email=user_data.get('email'))
        return user

    async def get_jwt_for_user(self, user_data: dict[str, Any]) -> JWTPair:
        user = await self.get_or_create_user(user_data)
        return new_jwt_for_user(user)
