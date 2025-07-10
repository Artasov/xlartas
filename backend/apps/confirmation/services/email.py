# confirmation/services/email.py
from typing import TYPE_CHECKING

from django.conf import settings

from apps.confirmation.services.actions import ConfirmationAction
from apps.confirmation.services.base import ConfirmationCodeService
from apps.core.exceptions.user import UserException

if TYPE_CHECKING: pass


class EmailConfirmationCodeService(ConfirmationCodeService):
    @classmethod
    def get_confirmation_method(cls) -> str:
        return 'email'

    @classmethod
    async def send_code(
            cls, code: str, action: ConfirmationAction,
            user: settings.AUTH_USER_MODEL,
            extra_data: dict | None = None
    ) -> None:
        from apps.confirmation.tasks.tasks import send_confirmation_code_to_email_task
        if not user.email: raise UserException.EmailDoesNotExists()
        if extra_data:
            email = extra_data.get('new_email', str(user.email))
            if not email: email = str(user.email)
        else:
            email = str(user.email)
        send_confirmation_code_to_email_task.delay(
            action=action,
            email=email,
            code=code
        )
