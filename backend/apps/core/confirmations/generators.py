from django.conf import settings
from django.core.handlers.asgi import ASGIRequest

from apps.core.confirmations.manager import CoreConfirmation
from apps.core.tasks.mail_tasks import send_confirmation_email_task
from apps.confirmation.models.base import ActionsMails


async def generate_confirm_code_and_send(request: ASGIRequest, action: str):
    code = await CoreConfirmation.new_for_user_if_possible(
        user=request.user,
        action=action,
        expire_minutes=10
    )
    if not settings.DEV:
        send_confirmation_email_task.delay(
            action_mail=ActionsMails.get(code.action),
            to_email=request.user.email,
            code=code.code
        )
    else:
        print(f'Generated new code: {code.code}')
