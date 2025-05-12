# social_oauth/providers/google/provider.py

import logging
from typing import Any

import aiohttp
from adjango.utils.funcs import set_image_by_url
from django.conf import settings

from apps.core.models import User
from apps.core.services.auth import new_jwt_for_user, JWTPair
from apps.social_oauth.exceptions.base import SocialOAuthException
from apps.social_oauth.models import GoogleUser
from apps.social_oauth.oauth_provider import OAuthProvider

log = logging.getLogger('global')


class GoogleOAuthProvider(OAuthProvider):
    @staticmethod
    async def link_user_account(user, user_data):
        google_id = user_data['sub']
        existing_link = await GoogleUser.objects.filter(google_id=google_id).afirst()
        if existing_link and existing_link.user != user:
            raise SocialOAuthException.AccountAlreadyLinkedAnotherUser()
        google_user, _ = await GoogleUser.objects.aget_or_create(user=user)
        google_user.google_id = google_id
        # Обновляем другие поля при необходимости
        await google_user.asave()

    async def get_user_data(self, code: str) -> dict[str, Any]:
        """
        Получает данные пользователя от Google API.

        @param code: Код авторизации, полученный от Google OAuth2.
        @return: Словарь с данными пользователя.
        """
        async with aiohttp.ClientSession() as session:
            # Получение access_token
            async with session.post(
                    url='https://oauth2.googleapis.com/token',
                    headers={'Content-Type': 'application/x-www-form-urlencoded'},
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "grant_type": 'authorization_code',
                        "code": code,
                        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    }
            ) as resp:
                response_data = await resp.json()
                log.info('OAuth Google request:')
                log.info({
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "grant_type": 'authorization_code',
                    "code": code,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                })
                log.info('OAuth Google response:')
                log.info(response_data)
                resp.raise_for_status()
                access_token = response_data['access_token']

            # Получение информации о пользователе
            async with session.get('https://www.googleapis.com/oauth2/v3/userinfo', headers={
                'Authorization': f'Bearer {access_token}',
            }) as user_resp:
                user_resp.raise_for_status()
                user_data = await user_resp.json()
                log.info(f'Google user data:\n{user_data}')

        return user_data

    async def get_or_create_user(self, user_data: dict[str, Any]) -> User:
        google_id = user_data.get('sub')
        if not google_id: raise SocialOAuthException.GoogleIDNotProvided()
        try:
            google_user = await GoogleUser.objects.select_related('user').aget(google_id=google_id)
            user = google_user.user
        except GoogleUser.DoesNotExist:
            try:
                user = await User.objects.aget(email=user_data.get('email'))
            except User.DoesNotExist:
                email = user_data.get('email', '')
                first_name = user_data.get('given_name', '')
                last_name = user_data.get('family_name', '')
                username = email.split('@')[0] if email else f'google_{google_id}'

                user = await User.objects.acreate(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    is_email_confirmed=bool(email),
                )
                if user_data.get('picture'):
                    await set_image_by_url(user, 'avatar', user_data.get('picture'))
            g_email = user_data.get('email')
            if g_email:
                user.is_email_confirmed = True
                await user.asave()
            await GoogleUser.objects.acreate(
                user=user, google_id=google_id, email=g_email
            )

        return user

    async def get_jwt_for_user(self, user_data: dict[str, Any]) -> JWTPair:
        user = await self.get_or_create_user(user_data)
        return new_jwt_for_user(user)
