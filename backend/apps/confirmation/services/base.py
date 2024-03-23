from datetime import timedelta
from typing import Optional

from django.utils.timezone import now

from apps.Core.models.user import User
from apps.Core.services.base import get_timedelta
from apps.confirmation.exceptions.base import (
    ConfirmationCodeOutdated,
    ConfirmationCodeInvalid,
    ConfirmationCodeLatestNotFound, ConfirmationCodeNotLatest, ActionNotSpecifiedError,
    ConfirmationCodeSentTooOften, ConfirmationCodeAlreadyUsed
)
from apps.confirmation.models.base import ConfirmationCode


class ConfirmationCodeManager:
    class InvalidInitial(Exception):
        pass

    class InvalidUserInitial(Exception):
        pass

    def __init__(self, code_str: str = None, code: ConfirmationCode = None, ACTIONS=None):
        self.ACTIONS = ACTIONS
        if code_str is not None:
            try:
                self.code: ConfirmationCode = ConfirmationCode.objects.get(code=code_str)
            except Exception:
                raise ConfirmationCodeInvalid()
        elif code is not None:
            self.code: ConfirmationCode = code
        else:
            raise self.InvalidInitial()

        try:
            self.user = self.code.user
        except Exception:
            raise self.InvalidUserInitial('User not received.')

    @staticmethod
    async def is_expired(code: ConfirmationCode) -> bool:
        return code.expired_at < now()

    async def is_executable_or_raise(self):
        if self.code.is_used: raise ConfirmationCodeAlreadyUsed()
        if await self.is_expired(self.code): raise ConfirmationCodeOutdated()
        latest_code = await self.get_latest_confirmation_code(user=self.user)
        if latest_code is None:
            raise ConfirmationCodeLatestNotFound()
        if latest_code.code != self.code.code:
            raise ConfirmationCodeNotLatest()

    async def execute(self):
        """
        !!! You must override this method to perform your actions. !!!
        """
        await self.is_executable_or_raise()

    @staticmethod
    async def new_for_user_if_possible(user: User, action: str, expire_minutes: int = 10) -> ConfirmationCode:
        if not action: raise ActionNotSpecifiedError()
        latest_code = await ConfirmationCodeManager.get_latest_confirmation_code(user=user)
        if ConfirmationCodeManager.is_code_sending_too_often(latest_code):
            raise ConfirmationCodeSentTooOften()
        return await ConfirmationCode.objects.acreate(
            user=user,
            action=action,
            expired_at=get_timedelta(minutes=expire_minutes)
        )

    @staticmethod
    async def get_latest_confirmation_code(**kwargs) -> Optional[ConfirmationCode]:
        try:
            return await ConfirmationCode.objects.filter(
                **kwargs
            ).alatest('created_at')
        except ConfirmationCode.DoesNotExist:
            return None

    @staticmethod
    def is_code_sending_too_often(code: ConfirmationCode) -> bool:
        return True if code and code.created_at > now() - timedelta(minutes=1) else False
