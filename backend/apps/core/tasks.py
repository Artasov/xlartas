import logging
from time import sleep

from adjango.decorators import task
from celery import shared_task
from celery_singleton import Singleton

from config.celery import app

log = logging.getLogger('global')


@app.task(base=Singleton, unique_on=['rand_integer', ])
@task('global')
def test_task(rand_integer):
    sleep(5)
    log.warning(f"TASK SINGLETON SUCCESS {rand_integer}")


@shared_task
@task('global')
def test_periodic_task(param1):
    log.warning(f"TASK PERIODIC SUCCESS {param1}")
