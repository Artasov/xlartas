# social_oauth/providers/google/provider.py

from utils.log import get_global_logger
from typing import Any

import aiohttp
from django.conf import settings

from apps.core.models import User
from apps.core.services.auth import new_jwt_for_user, JWTPair
from apps.social_oauth.exceptions.base import SocialOAuthException
from apps.social_oauth.models import GoogleUser
from apps.social_oauth.oauth_provider import OAuthProvider, OAuthProviderMixin

log = get_global_logger()


class GoogleOAuthProvider(OAuthProviderMixin, OAuthProvider):
    @staticmethod
    async def link_user_account(user, user_data):
        google_id = user_data['sub']
        await OAuthProviderMixin.link_user_account_model(
            user,
            GoogleUser,
            'google_id',
            google_id,
        )

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
                        'client_id': settings.GOOGLE_CLIENT_ID,
                        'client_secret': settings.GOOGLE_CLIENT_SECRET,
                        'grant_type': 'authorization_code',
                        'code': code,
                        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
                    }
            ) as resp:
                response_data = await resp.json()
                log.info('OAuth Google request:')
                log.info({
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': settings.GOOGLE_REDIRECT_URI,
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
        email = user_data.get('email', '')
        first_name = user_data.get('given_name', '')
        last_name = user_data.get('family_name', '')
        if not google_id:
            raise SocialOAuthException.GoogleIDNotProvided()
        if not email:
            raise SocialOAuthException.GoogleEmailWasNotProvided()

        return await self._get_or_create_user_base(
            GoogleUser,
            'google_id',
            google_id,
            email=email,
            username=email.split('@')[0] if email else f'google_{google_id}',
            first_name=first_name,
            last_name=last_name,
            avatar_url=user_data.get('picture'),
        )

    async def get_jwt_for_user(self, user_data: dict[str, Any]) -> JWTPair:
        user = await self.get_or_create_user(user_data)
        return new_jwt_for_user(user)
