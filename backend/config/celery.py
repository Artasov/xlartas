from __future__ import absolute_import

import os
import sys

from adjango.utils.crontab import Crontab
from celery import Celery
from celery.schedules import crontab
from django.apps import apps

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()
app = Celery('config')
app.config_from_object('config.settings', namespace='CELERY')
app.conf.update(
    worker_concurrency=5,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=50,
    broker_connection_retry_on_startup=True,
    broker_transport_options={
        'max_retries': 3, 'interval_start': 0,
        'interval_step': 0.5, 'interval_max': 2
    },
)

app.autodiscover_tasks(lambda: [n.name for n in apps.get_app_configs()])
app.conf.beat_schedule = {
    'send_mailing': {
        'task': 'apps.mailing.tasks.check_and_send_mailings',
        'schedule': Crontab.every(minutes=1),
    },
    'cleanup_conversions': {
        'task': 'apps.converter.tasks.cleanup_conversions',
        'schedule': crontab(hour=3, minute=0),
    },
}
