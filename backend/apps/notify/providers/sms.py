# notify/providers/sms.py
import logging
from typing import Any, TYPE_CHECKING

from django.template.loader import render_to_string

from apps.core.services.phone.base import send_sms
from .base import INotifyProvider

if TYPE_CHECKING:
    from apps.core.models import User

log = logging.getLogger('sms')


class SMSProvider(INotifyProvider):
    name = 'sms'

    def send(self, recipient: 'User', context: dict[str, Any], notify_type: str) -> None:
        message = render_to_string(f'notify/{self.name}/{notify_type}.html', context)
        send_sms(
            phone=str(recipient.phone),
            message=message
        )
