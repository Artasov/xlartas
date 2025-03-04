from adjango.decorators import task
from adjango.utils.mail import send_emails
from celery import shared_task
from django.utils import timezone

from .models import Mailing


@shared_task
@task('global')
def check_and_send_mailings():
    """
    Задача для проверки запланированных рассылок и постановки их в очередь отправки.
    """
    now = timezone.now()
    mailings = Mailing.objects.filter(sent=False, start_date__lte=now)
    for mailing in mailings:
        send_mailing.delay(mailing.id)


@shared_task
@task('global')
def send_mailing(mailing_id):
    """
    Задача для отправки конкретной рассылки.
    """
    try:
        mailing = Mailing.objects.get(id=mailing_id, sent=False)
    except Mailing.DoesNotExist:
        return

    # Получаем список email адресов получателей
    recipients: list[str] = list(mailing.users.values_list('email', flat=True))
    if not recipients:
        mailing.sent = True
        mailing.save(update_fields=['sent'])
        return

    # Подготавливаем контекст для шаблона письма
    context = {
        'subject': mailing.subject,
        'content': mailing.html_content,
    }
    send_emails(emails=recipients, context=context, subject=mailing.subject, template='mailing/base.html')
    mailing.sent = True
    mailing.save(update_fields=['sent'])
