# confirmation/services/phone.py
from typing import TYPE_CHECKING

from django.conf import settings

from apps.confirmation.services.actions import ConfirmationAction
from apps.confirmation.services.base import ConfirmationCodeService
from apps.core.exceptions.user import UserException

if TYPE_CHECKING: pass


class PhoneConfirmationCodeService(ConfirmationCodeService):
    @staticmethod
    def get_confirmation_method() -> str:
        return 'phone'

    @staticmethod
    async def send_code(code: str, action: ConfirmationAction,
                        user: settings.AUTH_USER_MODEL,
                        extra_data: dict = None) -> None:
        from apps.confirmation.tasks.tasks import send_confirmation_code_to_phone_task
        if not user.phone: raise UserException.PhoneDoesNotExists()
        if extra_data:
            phone = extra_data.get('new_phone', str(user.phone))
            if not phone: phone = str(user.phone)
        else:
            phone = str(user.phone)
        send_confirmation_code_to_phone_task.delay(
            action=action, phone=phone, code=code
        )
