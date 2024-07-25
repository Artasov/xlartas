from celery import shared_task

from apps.Core.services.mail.base import send_email_by_template
from apps.confirmation.models.base import ActionsMail


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
def send_confirmation_email_task(to_email: str, action_mail: ActionsMail, code) -> None:
    send_email_by_template(
        subject=action_mail.get('subject'),
        to_email=to_email,
        template='confirmation/mail/code_confirmation.html',
        context={
            'text': action_mail.get('text'),
            'subject': action_mail.get('subject'),
            'code': code
        }
    )


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
def send_survey_access(to_email: str, action_mail: ActionsMail, link):
    send_email_by_template(
        subject=action_mail.get('subject'),
        to_email=to_email,
        template='survey/mail/survey_access.html',
        context={
            'text': action_mail.get('text'),
            'subject': action_mail.get('subject'),
            'link': link,
        }
    )


@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
def send_auto_created_user(to_email: str, action_mail: ActionsMail, username, password):
    send_email_by_template(
        subject=action_mail.get('subject'),
        to_email=to_email,
        template='Core/mail/auto_create_user.html',
        context={
            'text': action_mail.get('text'),
            'subject': action_mail.get('subject'),
            'username': username,
            'password': password,
        }
    )
# @shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 20})
# def send_confirmation_email_task(host, is_secure: bool, to_email: str, subject: str, text: str, code) -> None:
#     send_email_by_template(
#         subject=subject,
#         to_email=to_email,
#         template='confirmation/mail/code_confirmation.html',
#         context={
#             'text': text,
#             'subject': subject,
#             'host': host,
#             'is_secure': is_secure,
#             'code': code
#         }
#     )
