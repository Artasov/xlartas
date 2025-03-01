# confirmation/tasks/tasks.py
import logging
from typing import TYPE_CHECKING

from adjango.utils.mail import send_emails
from celery import shared_task
from django.conf import settings

from apps.core.services.phone.base import send_sms

if TYPE_CHECKING: from apps.confirmation.services.actions import ConfirmationAction

log = logging.getLogger('notify')


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
def send_confirmation_code_to_email_task(email: str, action: 'ConfirmationAction', code: str) -> None:
    print('###################')
    print('###################')
    print(settings.EMAIL_HOST_USER)
    print(settings.EMAIL_HOST_PASSWORD)
    send_emails(
        subject=action.get('subject'), emails=(email,), template='confirmation/mail/code_confirmation.html',
        context={'text': action.get('text'), 'subject': action.get('subject'), 'code': code})


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
def send_confirmation_code_to_phone_task(phone: str, action: 'ConfirmationAction', code: str) -> None:
    # Subject не учитывается для SMS
    send_sms(phone=phone, message=f'{code}\n{action["text"]}')
