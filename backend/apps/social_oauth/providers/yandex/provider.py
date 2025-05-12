# social_oauth/providers/yandex/provider.py

import logging
from typing import Any

import aiohttp
from adjango.utils.funcs import set_image_by_url
from django.conf import settings

from apps.core.models import User
from apps.core.services.auth import new_jwt_for_user, JWTPair
from apps.social_oauth.exceptions.base import SocialOAuthException
from apps.social_oauth.models import YandexUser
from apps.social_oauth.oauth_provider import OAuthProvider

log = logging.getLogger('social_auth')


class YandexOAuthProvider(OAuthProvider):
    @staticmethod
    async def link_user_account(user, user_data):
        yandex_id = user_data['id']
        existing_link = await YandexUser.objects.filter(yandex_id=yandex_id).afirst()
        if existing_link and existing_link.user != user:
            raise SocialOAuthException.AccountAlreadyLinkedAnotherUser()
        yandex_user, _ = await YandexUser.objects.aget_or_create(user=user)
        yandex_user.yandex_id = yandex_id
        # Обновляем другие поля при необходимости
        await yandex_user.asave()

    async def get_user_data(self, code: str) -> dict[str, Any]:
        """
        Получает данные пользователя от Yandex API.

        @param code: Код авторизации, полученный от Yandex OAuth2.
        @return: Словарь с данными пользователя.
        """
        async with aiohttp.ClientSession() as session:
            # Получение access_token
            async with session.post(
                    url='https://oauth.yandex.ru/token',
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "client_id": settings.YANDEX_CLIENT_ID,
                        "client_secret": settings.YANDEX_CLIENT_SECRET,
                        "redirect_uri": settings.YANDEX_REDIRECT_URI,
                    }
            ) as resp:
                response_data = await resp.json()
                log.info('OAuth Yandex response:')
                log.info(response_data)
                resp.raise_for_status()
                access_token = response_data['access_token']

            # Получение информации о пользователе
            async with session.get('https://login.yandex.ru/info', headers={
                'Authorization': f'OAuth {access_token}',
            }) as user_resp:
                user_resp.raise_for_status()
                user_data = await user_resp.json()
                log.info(f'Yandex user data:\n{user_data}')

        return user_data

    async def get_or_create_user(self, user_data: dict[str, Any]) -> User:
        yandex_id = user_data.get('id')
        if not yandex_id: raise SocialOAuthException.YandexIDNotProvided()
        try:
            yandex_user = await YandexUser.objects.select_related('user').aget(yandex_id=yandex_id)
            user = yandex_user.user
        except YandexUser.DoesNotExist:
            email = user_data.get('default_email', '')
            if not email:
                raise SocialOAuthException.YandexEmailWasNotProvided()
            try:
                user = await User.objects.aget(email=user_data.get('email'))
            except User.DoesNotExist:
                first_name = user_data.get('first_name', '')
                last_name = user_data.get('last_name', '')
                username = email.split('@')[0] if email else f'yandex_{yandex_id}'
                log.info(f'Yandex auth: {user_data}')
                user = await User.objects.acreate(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    is_email_confirmed=bool(email),
                )
                if not user_data.get('is_avatar_empty'):
                    avatar_id = user_data.get('default_avatar_id')
                    # TODO: сделать правильное получение фото
                    if avatar_id:
                        avatar_url = f'https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200'
                        await set_image_by_url(user, 'avatar', avatar_url)
            if not user.is_email_confirmed:
                user.is_email_confirmed = True
                await user.asave()
            await YandexUser.objects.acreate(user=user, yandex_id=yandex_id, email=email)
        return user

    async def get_jwt_for_user(self, user_data: dict[str, Any]) -> JWTPair:
        user = await self.get_or_create_user(user_data)
        return new_jwt_for_user(user)
