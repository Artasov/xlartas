from adjango.decorators import task
from adjango.utils.mail import send_emails
from celery import shared_task
from django.utils import timezone

from .models import Mailing


def chunk_list(lst: list, chunk_size: int):
    """
    Разбивает список на чанки (пакеты) указанного размера.
    """
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


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

    # Выбираем пользователей, которым еще не отправлялось письмо
    unsent_users = mailing.users.exclude(id__in=mailing.sent_users.values_list('id', flat=True))
    if not unsent_users.exists():
        mailing.sent = True
        mailing.save(update_fields=['sent'])
        return

    # Подготавливаем контекст для шаблона письма
    context = {
        'subject': mailing.subject,
        'content': mailing.html_content,
    }

    # Получаем список кортежей (user_id, email) пользователей, которым еще не отправлялось письмо
    user_data = list(unsent_users.values_list('id', 'email'))

    # Определяем размер чанка для рассылки (например, 50 адресов)
    BATCH_SIZE = 50
    for chunk in chunk_list(user_data, BATCH_SIZE):
        recipient_ids = [uid for uid, email in chunk]
        recipient_emails = [email for uid, email in chunk]
        send_emails(
            emails=recipient_emails,
            context=context,
            subject=mailing.subject,
            template='mailing/base.html'
        )
        # Отмечаем, что письма отправлены указанным пользователям
        mailing.sent_users.add(*recipient_ids)

    # Если письма отправлены всем пользователям, помечаем рассылку как завершённую
    if not mailing.users.exclude(id__in=mailing.sent_users.values_list('id', flat=True)).exists():
        mailing.sent = True
        mailing.save(update_fields=['sent'])
