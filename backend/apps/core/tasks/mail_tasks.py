# core/tasks/mail_tasks.py
from adjango.decorators import task
from adjango.utils.mail import send_emails
from celery import shared_task


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
@task('global')
def send_confirmation_email_task(to_email: str, action_mail: dict, code) -> None:
    send_emails(
        subject=action_mail.get('subject'),
        emails=(to_email,),
        template='confirmation/mail/code_confirmation.html',
        context={
            'text': action_mail.get('text'),
            'subject': action_mail.get('subject'),
            'code': code
        }
    )


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
@task('global')
def send_survey_access(to_email: str, action_mail: dict, link):
    send_emails(
        subject=action_mail.get('subject'),
        emails=(to_email,),
        template='survey/mail/survey_access.html',
        context={
            'text': action_mail.get('text'),
            'subject': action_mail.get('subject'),
            'link': link,
        }
    )


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
@task('global')
def send_auto_created_user(to_email: str, action_mail: dict, username, password):
    send_emails(
        subject=action_mail.get('subject'),
        emails=(to_email,),
        template='apps.core/mail/auto_create_user.html',
        context={
            'text': action_mail.get('text'),
            'subject': action_mail.get('subject'),
            'username': username,
            'password': password,
        }
    )
