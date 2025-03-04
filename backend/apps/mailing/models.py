from adjango.models.mixins import ACreatedUpdatedAtMixin
from django.conf import settings
from django.db.models import CharField, TextField, DateTimeField, ManyToManyField, BooleanField
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class Mailing(ACreatedUpdatedAtMixin):
    subject = CharField(_('Тема'), max_length=255)
    html_content = TextField(
        _('HTML content'),
        help_text=_('Используйте HTML для форматирования (цветной, жирный текст, картинки и пр.)')
    )
    start_date = DateTimeField(
        _('Start date'),
        default=timezone.now,
        help_text=_('Дата и время, когда рассылка должна быть отправлена')
    )
    users = ManyToManyField(
        settings.AUTH_USER_MODEL,
        verbose_name=_('Users'),
        help_text=_('Выберите пользователей, которым будет отправлена рассылка')
    )
    sent_users = ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='mailings_received',
        verbose_name=_('Отправленные пользователи'),
        help_text=_('Пользователи, которым уже было отправлено письмо')
    )
    sent = BooleanField(_('Sent'), default=False)

    class Meta:
        verbose_name = _('Mailing')
        verbose_name_plural = _('Mailings')
        ordering = ('-created_at',)

    def __str__(self):
        return self.subject
