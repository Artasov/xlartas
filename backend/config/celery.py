from __future__ import absolute_import

import os
import sys

from adjango.utils.crontab import Crontab
from celery import Celery
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
    # 'test_periodic_task': {
    #     'task': 'apps.core.tasks.test_tasks.test_periodic_task',
    #     'schedule': timedelta(seconds=15) if settings.INTENSIVE_HEALTH_TEST else timedelta(minutes=5),
    #     'args': ('value1',),
    # },
    # 'auto_renewal_employees_schedules': {
    #     'task': 'apps.commerce.tasks.employee_tasks.auto_renewal_employees_schedules',
    #     'schedule': Crontab.every(monday='00:00'),
    # },
    # 'recalculate_psychologists_rating_task': {
    #     'task': 'apps.psychology.tasks.psychologist.recalculate_psychologists_rating_task',
    #     'schedule': Crontab.every(minutes=20),
    # },
    # 'create_rooms_for_nearest_consultations': {
    #     'task': 'apps.psychology.tasks.consultation.create_rooms_for_nearest_consultations_task',
    #     'schedule': Crontab.every(minutes=1),
    # },
    # 'process_pending_notifications': {
    #     'task': 'apps.notify.tasks.process_pending_notifications',
    #     'schedule': Crontab.every(minutes=2),
    # },
    # 'process_flickering': {
    #     'task': 'apps.bitrix24.tasks.process_flickering_task',
    #     'schedule': Crontab.every(minutes=5),
    # },
    # 'calculate_ltv_clients': {
    #     'task': 'apps.ltv.tasks.calculate_ltv_clients_task',
    #     'schedule': Crontab.every(days=1),
    # },

}
