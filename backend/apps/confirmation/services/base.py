# confirmation/services/base.py
import logging
from datetime import timedelta
from typing import TYPE_CHECKING, Union

from adjango.utils.base import AsyncAtomicContextManager, diff_by_timedelta
from adrf.requests import AsyncRequest
from django.conf import settings
from django.core.handlers.asgi import ASGIRequest
from django.core.handlers.wsgi import WSGIRequest
from django.utils.timezone import now

from apps.confirmation.confirmation_loader import confirmation_actions
from apps.confirmation.exceptions.base import ConfirmationException
from apps.confirmation.services.actions import is_action_exists, ConfirmationResult, ConfirmationAction
from apps.core.confirmations.actions import CoreConfirmationActionType
from apps.core.exceptions.user import UserException

if TYPE_CHECKING:
    from apps.confirmation.models.base import (
        ConfirmationCode,
        EmailConfirmationCode,
        PhoneConfirmationCode
    )
    from apps.core.models import User

log = logging.getLogger('global')


async def get_confirmation_code_instance(
        method: str
) -> Union[type, 'EmailConfirmationCode', 'PhoneConfirmationCode']:
    """
    Возвращает класс нужной модели для кода подтверждения на основе указанного метода.

    @param method: Метод подтверждения ('email', 'phone' и т.д.).
    @return: Класс модели, соответствующий методу подтверждения.
    @raises ConfirmationException.Method.Unknown: Если указанный метод подтверждения неизвестен.
    """
    from django.apps import apps
    from apps.confirmation.models.base import ConfirmationCode
    # Собираем все модели, которые наследуют от ConfirmationCode
    confirmation_models = {
        model_class.get_confirmation_method(): model_class
        for model_class in apps.get_models()
        if issubclass(model_class, ConfirmationCode) and model_class is not ConfirmationCode
    }
    # Проверяем, существует ли такой метод подтверждения
    if method not in confirmation_models.keys(): raise ConfirmationException.Method.Unknown()
    # Возвращаем соответствующий класс модели
    return confirmation_models[method]


class ConfirmationCodeService:
    is_used: bool

    @classmethod
    def get_confirmation_method(cls) -> str:
        raise NotImplementedError

    @classmethod
    async def send_code(
            cls, code: str, action: ConfirmationAction,
            user: 'User', extra_data: dict | None = None
    ) -> None:
        raise NotImplementedError

    @staticmethod
    async def create_and_send(
            request: AsyncRequest | WSGIRequest | ASGIRequest,
            action: str,
            method: str,
            credential: str | None,
            raise_exceptions: bool = False,
    ) -> 'ConfirmationCode':
        data = request.data
        user: 'User' = await ConfirmationCodeService.can_new(
            request, action, method, credential,
            raise_exceptions=raise_exceptions
        )
        # Sending
        confirmation_model = await get_confirmation_code_instance(method)
        return await confirmation_model.send_new(user=user, action=action, extra_data={
            'new_phone': data.get('new_phone'),
            'new_email': data.get('new_email'),
        })

    @staticmethod
    async def can_new(
            request, action: str,
            method: str,  # noqa Просто не используется пока
            credential: str | None,
            raise_exceptions: bool = False
    ) -> Union['User', bool]:
        from apps.core.models import User
        if action not in confirmation_actions: raise ConfirmationException.Action.Unknown()
        if not request.user.is_authenticated and action not in (
                CoreConfirmationActionType.SIGNUP,
                CoreConfirmationActionType.AUTH
        ): raise UserException.NotAuthorized()

        if action in (  # Action with authentication and need user from request
                CoreConfirmationActionType.NEW_PHONE,
                CoreConfirmationActionType.NEW_EMAIL,
                CoreConfirmationActionType.NEW_PASSWORD,
        ):
            if not request.user.is_authenticated:
                if raise_exceptions: raise UserException.NotAuthorized()
                return False
            else:
                user = request.user
        else:
            user = await User.objects.aby_creds(credential)
            if not user:
                if raise_exceptions: raise UserException.NotFound()
                return False
        return user

    @classmethod
    async def send_new(
            cls: 'ConfirmationCode', user: settings.AUTH_USER_MODEL, action: str,
            expire_minutes: int = settings.MINUTES_CONFIRMATION_CODE_EXPIRES, extra_data: dict = None
    ) -> 'ConfirmationCode':
        from apps.confirmation.models.base import ConfirmationCode
        if not is_action_exists(action): raise ConfirmationException.Action.DoesNotExists()

        latest_code = await ConfirmationCode.objects.aget_latest(user=user)
        if latest_code: latest_code.user = user
        if latest_code and await latest_code.is_sending_too_often():
            raise ConfirmationException.Code.SentTooOften()

        code = await cls.objects.acreate(
            user=user, action=action, expired_at=diff_by_timedelta(timedelta(minutes=expire_minutes))
        )
        action: ConfirmationAction = confirmation_actions.get(code.action).copy()
        del action['func']
        method_name = cls.get_confirmation_method().upper()
        if False and (settings.DEBUG and not settings.DEBUG_SEND_NOTIFIES) or user.is_test:
            log.debug(f'{method_name} {code.action} user={user.id} CONFIRMATION CODE: {code.code}')
        else:
            log.info(f'{method_name} {code.action} user={user.id} CONFIRMATION CODE: {code.code}')
            await cls.send_code(code.code, action, user, extra_data)
        return code

    async def confirmation(self: 'ConfirmationCode', **kwargs):
        await self.ready_for_make_action_or_raise()
        return await self.make_action(**kwargs)

    async def make_action(self: 'ConfirmationCode', **kwargs) -> ConfirmationResult:
        async with AsyncAtomicContextManager():
            func = self.get_action_func()
            self.is_used = True
            await self.asave()
            result = await func(self, **kwargs)
            return ConfirmationResult(result=result, action=self.action)

    def get_action_func(self: 'ConfirmationCode'):
        if not is_action_exists(self.action): raise ConfirmationException.Action.DoesNotExists()
        return confirmation_actions[self.action]['func']

    async def is_sending_too_often(self: 'ConfirmationCode') -> bool:
        from apps.confirmation.models.base import ConfirmationCode
        # Получаем последний код для этого пользователя и действия
        latest_code = await ConfirmationCode.objects.aget_latest(user=self.user, action=self.action)
        # Если код не найден, можно отправлять новый код
        if not latest_code: return False
        # Если код найден и разница между текущим временем и
        # временем создания меньше MAX_FREQUENCY, то отправляли слишком часто
        if now() - latest_code.created_at < timedelta(
                seconds=settings.SECONDS_MAX_FREQUENCY_SENDING_CONFIRMATION_CODE
        ): return True
        return False

    async def is_expired(self: 'ConfirmationCode') -> bool:
        return self.expired_at < now()

    async def ready_for_make_action_or_raise(self: 'ConfirmationCode'):
        from apps.confirmation.models.base import ConfirmationCode
        if self.is_used: raise ConfirmationException.Code.AlreadyUsed()
        if await self.is_expired(): raise ConfirmationException.Code.Outdated()
        latest_code = await ConfirmationCode.objects.aget_latest(user=self.user)
        if latest_code is None: raise ConfirmationException.Code.LatestNotFound()
        if latest_code.code != self.code: raise ConfirmationException.Code.NotLatest()
