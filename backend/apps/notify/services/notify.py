# notify/services/notify.py

import logging
from typing import TYPE_CHECKING

from adjango.utils.common import traceback_str
from asgiref.sync import sync_to_async
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

from apps.core.serializers.user.base import UserPublicSerializer

log = logging.getLogger('notify')

if TYPE_CHECKING:
    from apps.notify.models import Notify


class NotifyService:
    def send(self: 'Notify') -> None:
        from apps.notify.registry import NOTIFY_CONFIGS, Notifies
        from apps.notify.providers.base import INotifyProvider

        try:
            config = NOTIFY_CONFIGS.get(self.notify_type)
            if not config:
                log.error(f'Unknown notification type: {self.notify_type}')
                self.status = self.Status.FAILED
                self.save(update_fields=['status'])
                return

            providers: list[type[INotifyProvider]] = config.providers
            subject = Notifies(self.notify_type).label
            context = {
                **self.context,
                'subject': subject,
                'user': UserPublicSerializer(self.recipient).data,
            }

            for provider_cls in providers:
                provider: INotifyProvider = provider_cls()
                if not settings.DEBUG and not self.recipient.is_test:
                    provider.send(self.recipient, context, self.notify_type)
                else:
                    rendered = render_to_string(
                        f'notify/{provider.name}/{self.notify_type}.html',
                        context,
                    )
                    log.info(
                        f'Notify {provider.name} for {self.recipient} {context} sent \n'
                        f'Rendered text:{rendered}'
                    )

            self.status = self.Status.SENT
            self.sent_time = timezone.now()  # noqa
            self.save(update_fields=['status', 'sent_time'])
            log.info(f'Notification id={self.id} sent successfully')

        except Exception as e:
            log.error(f'Failed to send notification {self.id}: {traceback_str(e)}')
            self.status = self.Status.FAILED  # noqa
            self.save(update_fields=['status'])

    async def asend(self: 'Notify') -> None:
        await sync_to_async(self.send)()
