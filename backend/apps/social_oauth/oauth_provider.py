# social_oauth/oauth_provider.py

import logging
from abc import ABC, abstractmethod
from typing import Any

from apps.core.models import User
from apps.core.services.auth import JWTPair

log = logging.getLogger('social_auth')


class OAuthProvider(ABC):

    @abstractmethod
    async def get_user_data(self, code: str) -> dict[str, Any]:
        """
        Получает данные пользователя от провайдера OAuth2.

        @param code: Код авторизации, полученный от OAuth2.
        @return: Словарь с данными пользователя.
        """
        pass

    @abstractmethod
    async def get_jwt_for_user(self, user_data: dict[str, Any]) -> JWTPair:
        """
        Генерирует JWT токены для пользователя.

        @param user_data: Данные пользователя от OAuth2 провайдера.
        @return: Пара JWT токенов.
        """
        pass

    @abstractmethod
    async def get_or_create_user(self, user_data: dict[str, Any]) -> User:
        """
        Получает или создает пользователя на основе данных провайдера.

        @param user_data: Данные пользователя от OAuth2 провайдера.
        @return: Объект пользователя.
        """
        pass

    @staticmethod
    async def link_user_account(user: User, user_data: dict[str, Any]):
        """
        Привязывает учетную запись пользователя к данным провайдера OAuth2.

        @param user: Объект пользователя, к которому привязывается учетная запись.
        @param user_data: Данные пользователя от OAuth2 провайдера.
        """
        pass
