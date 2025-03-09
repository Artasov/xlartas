# core/tasks/test_tasks.py
import logging
from time import sleep

from adjango.decorators import task
from celery import shared_task
from celery_singleton import Singleton
from django.conf import settings

log = logging.getLogger('console')


@shared_task
@task('global')
def test_task(rand_integer):
    sleep(5)
    if settings.INTENSIVE_HEALTH_TEST:
        log.info(f'TASK SUCCESS {rand_integer}')


@shared_task(base=Singleton, unique_on=['rand_integer', ])
@task('global')
def test_singleton_task(rand_integer):
    sleep(5)
    if settings.INTENSIVE_HEALTH_TEST:
        log.info(f'TASK SINGLETON SUCCESS {rand_integer}')


@shared_task
@task('global')
def test_periodic_task(param1):
    if settings.INTENSIVE_HEALTH_TEST:
        log.info(f'TASK PERIODIC SUCCESS {param1}')
