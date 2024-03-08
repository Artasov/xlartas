import logging
from time import sleep

from celery import shared_task
from celery_singleton import Singleton

from apps.mailing.services.services import send_email_by_template
from config.celery_conf import app

log = logging.getLogger('base')


@app.task(base=Singleton, unique_on=['rand_integer', ])
def test_task(rand_integer):
    sleep(5)
    log.warning(f"TASK SINGLETON SUCCESS {rand_integer}")


@shared_task
def test_periodic_task(param1):
    log.warning(f"TASK PERIODIC SUCCESS {param1}")


@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
def send_signup_confirmation_email_task(
        to_email: str, code: str, host: str, is_secure: bool) -> None:
    send_email_by_template(
        subject='Подтверждение регистрации',
        to_email=to_email,
        template='Core/email_templates/email_signup_confirmation.html',
        context={
            'host': host,
            'is_secure': is_secure,
            'code': code
        }
    )
