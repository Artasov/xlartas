from django.conf import settings
from django.core.handlers.asgi import ASGIRequest

from apps.Core.confirmations.manager import CoreConfirmation
from apps.Core.tasks.mail.base import send_confirmation_email_task
from apps.confirmation.models.base import ActionsMails


async def generate_confirm_code_and_send(request: ASGIRequest, action: str):
    code = await CoreConfirmation.new_for_user_if_possible(
        user=request.user,
        action=action,
        expire_minutes=10
    )
    if not settings.DEV:
        send_confirmation_email_task.delay(
            request=request,
            action_mail=ActionsMails.get('action'),
            to_email=request.user.email,
            code=code.code
        )
    else:
        print(f'Generated new code: {code.code}')
