# chat/models.py
from adjango.fields import AManyToManyField
from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import (
    FileField, Model, PositiveSmallIntegerField,
    CharField, BooleanField, TextField, ForeignKey, CASCADE
)
from django.utils.translation import gettext_lazy as _

from apps.chat.services import RoomService


class Room(AModel, RoomService):
    name = CharField(max_length=255, unique=True, null=True, blank=True, verbose_name=_('Room name'))
    participants = AManyToManyField('core.User', 'rooms', verbose_name=_('Participants'))
    max_participants = PositiveSmallIntegerField(default=2, verbose_name=_('Max participants'))

    class Meta:
        verbose_name = _('Room')
        verbose_name_plural = _('Rooms')


class Message(ACreatedUpdatedAtIndexedMixin):
    user = ForeignKey('core.User', CASCADE, 'messages', verbose_name=_('User'))
    room = ForeignKey(Room, CASCADE, 'messages', verbose_name=_('Room'))
    text = TextField(blank=True, null=True, verbose_name=_('Text'))
    is_read = BooleanField(default=False, verbose_name=_('Is read'))
    files = AManyToManyField('File', 'messages', blank=True, verbose_name=_('Files'))
    is_important = BooleanField(default=False, verbose_name=_('Is important'))

    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')


class File(AModel):
    file = FileField(upload_to='chat/files/', verbose_name=_('File'))

    class Meta:
        verbose_name = _('File')
        verbose_name_plural = _('Files')

    def __str__(self):
        return self.file.name
