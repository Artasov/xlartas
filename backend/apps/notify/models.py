# notify/models.py

from adjango.models import AModel
from django.db.models import (
    DateTimeField, ForeignKey, Model,
    CharField, CASCADE, JSONField, TextChoices, Index
)
from django.utils.translation import gettext_lazy as _

from apps.notify.managers.notify import NotifyManager
from apps.notify.services.notify import NotifyService


class Notify(AModel, NotifyService):
    objects = NotifyManager()

    class Status(TextChoices):
        PENDING = 'pending', _('Pending')
        SENT = 'sent', _('Sent')
        FAILED = 'failed', _('Send error')

    recipient = ForeignKey('core.User', CASCADE, 'notifications',
                           verbose_name=_('Recipient'))
    notify_type = CharField(max_length=50, verbose_name=_('Notify type'), db_index=True)
    status = CharField(max_length=10, choices=Status.choices, default=Status.PENDING,
                       verbose_name=_('Status'), db_index=True)
    scheduled_time = DateTimeField(db_index=True, verbose_name=_('Scheduled sent time'))
    sent_time = DateTimeField(null=True, blank=True, verbose_name=_('Sent time'))
    context = JSONField(default=dict, verbose_name=_('Context'))

    class Meta:
        verbose_name = _('Notify')
        verbose_name_plural = _('Notifies')
        ordering = ['-scheduled_time']
        indexes = [Index(fields=[
            'status', 'scheduled_time'
        ]), ]

    def __str__(self) -> str:
        return f'Notify {self.id} for {self.recipient} - {self.notify_type}'
