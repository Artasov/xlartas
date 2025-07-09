# social_oauth/oauth_provider.py

import logging
from abc import ABC, abstractmethod
from typing import Any

from adjango.utils.funcs import set_image_by_url

from apps.core.models import User
from apps.core.services.auth import JWTPair
from apps.social_oauth.exceptions.base import SocialOAuthException

log = logging.getLogger('social_auth')


class OAuthProviderMixin:
    """Mixin containing helper methods for OAuth providers."""

    async def _set_avatar_from_url(self, user: User, url: str | None) -> None:
        """Download and attach user avatar from URL if available."""
        if not url:
            return
        try:
            await set_image_by_url(user, 'avatar', url)
        except Exception as exc:  # pragma: no cover - logging only
            log.warning(f'Failed to set avatar for user {user.id} from {url}: {exc}')

    async def _get_or_create_user_base(
        self,
        provider_model: type,
        provider_id_field: str,
        provider_id: str,
        *,
        email: str | None = '',
        username: str = '',
        first_name: str = '',
        last_name: str = '',
        avatar_url: str | None = None,
    ) -> User:
        """Shared logic of retrieving or creating a user for OAuth providers."""

        try:
            provider_user = await provider_model.objects.select_related('user').aget(
                **{provider_id_field: provider_id}
            )
            user = provider_user.user
            if email and not user.is_email_confirmed:
                user.is_email_confirmed = True
                await user.asave()
            if avatar_url and not user.avatar:
                await self._set_avatar_from_url(user, avatar_url)
            return user
        except provider_model.DoesNotExist:
            user = None
            if email:
                try:
                    user = await User.objects.aget(email=email)
                except User.DoesNotExist:
                    user = None
            if not user:
                if not username:
                    username = email.split('@')[0] if email else f'{provider_id_field}_{provider_id}'
                user = await User.objects.acreate(
                    email=email or '',
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    is_email_confirmed=bool(email),
                )
                await self._set_avatar_from_url(user, avatar_url)
            elif email and not user.is_email_confirmed:
                user.is_email_confirmed = True
                await user.asave()

            kwargs = {'user': user, provider_id_field: provider_id}
            if hasattr(provider_model, 'email'):
                kwargs['email'] = email or ''
            await provider_model.objects.acreate(**kwargs)
            return user

    @staticmethod
    async def link_user_account_model(
        user: User,
        provider_model: type,
        provider_id_field: str,
        provider_id: str,
    ) -> None:
        """Link given ``user`` with OAuth ``provider_model`` by ``provider_id``.

        If the account with ``provider_id`` is already linked to another user,
        :class:`SocialOAuthException.AccountAlreadyLinkedAnotherUser` is raised.
        """
        existing_link = await provider_model.objects.select_related("user").filter(
            **{provider_id_field: provider_id}
        ).afirst()
        if existing_link and existing_link.user != user:
            raise SocialOAuthException.AccountAlreadyLinkedAnotherUser()

        provider_user, _ = await provider_model.objects.aget_or_create(user=user)
        setattr(provider_user, provider_id_field, provider_id)
        await provider_user.asave()


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
