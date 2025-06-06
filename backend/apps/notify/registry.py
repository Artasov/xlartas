# notify/registry.py

from dataclasses import dataclass
from typing import Type

from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _

from .providers.base import INotifyProvider
from .providers.email import EmailProvider
from .providers.sms import SMSProvider


@dataclass
class NotifyConfig:
    providers: list[Type[INotifyProvider]]


class Notifies(TextChoices):
    SUCCESS_GIFT_CERTIFICATE_ORDER = 'success_gift_certificate_order', _('Successful order gift certificate')
    NEW_CHAT_MESSAGE = 'new_chat_message', _('New chat message')
    IMPORTANT_CHAT_MESSAGE = 'important_chat_message', _('Important chat message')


NOTIFY_ORDER_MAPPING = {
    'giftcertificate': Notifies.SUCCESS_GIFT_CERTIFICATE_ORDER,
}

NOTIFY_CONFIGS: dict[str, NotifyConfig] = {
    Notifies.SUCCESS_GIFT_CERTIFICATE_ORDER: NotifyConfig(
        providers=[SMSProvider, EmailProvider],
    ),
    Notifies.NEW_CHAT_MESSAGE: NotifyConfig(
        providers=[EmailProvider],
    ),
    Notifies.IMPORTANT_CHAT_MESSAGE: NotifyConfig(
        providers=[EmailProvider],
    ),
}
