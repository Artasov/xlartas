# social_oauth/providers/vk/provider.py

import logging
from typing import Any

import aiohttp
from django.conf import settings
from rest_framework.exceptions import APIException

from apps.core.models import User
from apps.core.services.auth import new_jwt_for_user, JWTPair
from apps.social_oauth.exceptions.base import SocialOAuthException
from apps.social_oauth.models import VKUser
from apps.social_oauth.oauth_provider import OAuthProvider, OAuthProviderMixin

log = logging.getLogger('social_auth')


class VKOAuthProvider(OAuthProviderMixin, OAuthProvider):
    @staticmethod
    async def link_user_account(user, user_data):
        vk_id = user_data['id']
        await OAuthProviderMixin.link_user_account_model(
            user,
            VKUser, # TODO: Expected type 'Model', got 'Type[VKUser]' instead
            'vk_id',
            str(vk_id),
        )

    async def get_user_data(self, code: str) -> dict[str, Any]:
        """
        Получает данные пользователя от VK API.

        @param code: Код авторизации, полученный от VK OAuth2.
        @return: Словарь с данными пользователя.
        """
        async with aiohttp.ClientSession() as session:
            # Получение access_token
            async with session.get(
                    url='https://oauth.vk.com/access_token',
                    params={
                        'user_id': settings.VK_AUTH_CLIENT_ID,
                        'client_secret': settings.VK_AUTH_CLIENT_SECRET,
                        'redirect_uri': settings.VK_REDIRECT_URI,
                        'code': code,
                    }
            ) as resp:
                resp.raise_for_status()
                response_data = await resp.json()
                access_token = response_data.get('access_token')
                user_id = response_data.get('user_id')
                email = response_data.get('email')
                log.info(f'VK response data:\n{response_data}')
                if not access_token or not user_id:
                    raise APIException('VK OAuth failed: no access_token or user_id returned.')

            # Получение информации о пользователе
            async with session.get(
                    url='https://api.vk.com/method/users.get',
                    params={
                        'user_ids': user_id,
                        'fields': 'first_name,last_name,photo_200',
                        'access_token': access_token,
                        'v': '5.131'
                    }
            ) as user_resp:
                user_resp.raise_for_status()
                user_data_resp = await user_resp.json()
                log.info(f'VK user data:\n{user_data_resp}')
                user_data = user_data_resp['response'][0]
                user_data['email'] = email  # Добавляем email в данные пользователя

        return user_data

    async def get_or_create_user(self, user_data: dict[str, Any]) -> User:
        vk_id = str(user_data.get('id'))
        if not vk_id:
            raise SocialOAuthException.VKIDNotProvided()

        return await self._get_or_create_user_base(
            VKUser, # TODO: Expected type 'Model', got 'Type[VKUser]' instead
            'vk_id',
            vk_id,
            email=user_data.get('email', ''),
            username=(user_data.get('email', '').split('@')[0] if user_data.get('email') else f'vk_{vk_id}'),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            avatar_url=user_data.get('photo_200'),
        )

    async def get_jwt_for_user(self, user_data: dict[str, Any]) -> JWTPair:
        user = await self.get_or_create_user(user_data)
        return new_jwt_for_user(user)
