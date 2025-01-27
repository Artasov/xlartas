# notify/providers/email.py
from typing import Any, TYPE_CHECKING

from adjango.tasks import send_emails_task

from .base import INotifyProvider

if TYPE_CHECKING:
    from apps.core.models import User


class EmailProvider(INotifyProvider):
    name = 'emails'

    def send(self, recipient: 'User', context: dict[str, Any], notify_type: str) -> None:
        send_emails_task.delay(
            subject=context['subject'],
            emails=[recipient.email],
            template=f'notify/{self.name}/{notify_type}.html',
            context=context
        )
