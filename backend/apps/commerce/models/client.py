# commerce/models/client.py
from adjango.models import AModel
from django.db.models import (
    CharField, CASCADE, TextField,
    OneToOneField, TextChoices
)
from django.utils.translation import gettext_lazy as _

from apps.commerce.managers.client import ClientManager
from apps.commerce.services.client import ClientService


class Client(AModel, ClientService):
    objects = ClientManager()

    class Status(TextChoices):
        NEW = 'new', _('New')
        ACTIVE = 'active', _('Active')
        FLICKERING = 'flickering', _('Flickering')
        REJECTION = 'rejection', _('Rejection')

    about_me = TextField(verbose_name=_('About Me'))
    user = OneToOneField('core.User', CASCADE, related_name='client', verbose_name=_('User'))
    status = CharField(_('Status'), max_length=25, choices=Status.choices, default=Status.NEW, db_index=True)

    class Meta:
        verbose_name = _('Client')
        verbose_name_plural = _('Clients')

    def __str__(self):
        return f'BitrixClient:{self.id}'
