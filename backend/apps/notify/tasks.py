# notify/tasks.py
import logging

from adjango.decorators import task
from adjango.utils.common import traceback_str
from celery import shared_task
from django.db.transaction import atomic
from django.utils.timezone import now


@shared_task
@task('celery')
def process_pending_notifications() -> None:
    from .models import Notify
    now_ = now()
    with atomic():
        for n in Notify.objects.filter(
                status=Notify.Status.PENDING,
                scheduled_time__lte=now_,
        ).select_for_update(skip_locked=True):
            try:
                n.send()
            except Exception as e:
                log = logging.getLogger('notify')
                log.critical(f'Error sending notification {n.id}: {traceback_str(e)}')
