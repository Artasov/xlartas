# notify/managers/notify.py
import logging
from typing import Any, TYPE_CHECKING

from adjango.managers.base import AManager
from django.utils import timezone

log = logging.getLogger('notify')

if TYPE_CHECKING:
    from apps.notify.models import Notify
    from apps.core.models import User


class NotifyManager(AManager):
    async def acreate(
            self,
            recipient: 'User',
            notify_type: str,
            scheduled_time: timezone.datetime | None = None,
            context: dict[str, Any] | None = None,
            send_immediately: bool = False
    ) -> 'Notify':
        if scheduled_time is None:
            scheduled_time = timezone.now()
        if context is None:
            context = {}
        notify = await super().acreate(
            recipient=recipient,
            notify_type=notify_type,
            scheduled_time=scheduled_time,
            context=context,
        )
        log.info(
            f"Создано{' отложенное' if not send_immediately else ''} "
            f"уведомление id={notify.id} для пользователя {recipient.id} "
            f"| {context=}"
        )

        if send_immediately or scheduled_time <= timezone.now():
            await notify.asend()
        return notify
