from datetime import timedelta
from typing import Optional

from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string

from APP_mailing.services.services import send_email_by_template
from Core.models import ConfirmationCode


def get_latest_confirmation_code(user_id: int,
                                 code_type: str) -> Optional[ConfirmationCode]:
    try:
        return ConfirmationCode.objects.filter(
            user_id=user_id, type=code_type
        ).latest('created_at')
    except ConfirmationCode.DoesNotExist:
        return None


def is_code_sending_too_often(code: ConfirmationCode) -> bool:
    if code and code.created_at > timezone.now() - timedelta(minutes=1):
        return True
    return False


def create_confirmation_code_for_user(user_id: int,
                                      code_type: str) -> Optional[ConfirmationCode]:
    code_len = ConfirmationCode._meta.get_field('code').max_length
    code = get_random_string(code_len)
    return ConfirmationCode.objects.create(
        user_id=user_id,
        code=code,
        type=code_type,
        expired_at=timezone.now() + timedelta(minutes=settings.CONFIRMATION_CODE_LIFE_TIME)
    )


def send_password_reset_email(request, to_email: str, code: str) -> None:
    send_email_by_template(
        subject='Сброс пароля.',
        to_email=to_email,
        template='Core/email_templates/email_password_reset_confirmation.html',
        context={
            'get_host': request.get_host(),
            'is_secure': request.is_secure(),
            'code': code
        }
    )


def send_signup_confirmation_email(request, to_email: str, code: str) -> None:
    send_email_by_template(
        subject='Подтверждение регистрации',
        to_email=to_email,
        template='Core/email_templates/email_signup_confirmation.html',
        context={
            'get_host': request.get_host(),
            'is_secure': request.is_secure(),
            'code': code
        }
    )
