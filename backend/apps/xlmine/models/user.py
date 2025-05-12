# xlmine/models/user.py
import uuid as uuid_

from adjango.models import AModel
from adjango.models.mixins import ACreatedAtMixin
from django.db.models import OneToOneField, DecimalField, CASCADE, CharField, ForeignKey, FileField
from django.utils.translation import gettext_lazy as _


class UserXLMine(AModel):
    """
    Хранит данные о «майнкрафт-части» пользователя, в том числе текущее
    количество коинов. Связь 1 к 1 с основной моделью User.
    """
    user = OneToOneField('core.User', CASCADE, related_name='xlmine_user', primary_key=True)
    privilege = ForeignKey('xlmine.Privilege', CASCADE, 'xlmine_users', null=True, blank=True)
    uuid = CharField(max_length=100, default=uuid_.uuid4, unique=True, editable=True)
    skin = FileField(
        upload_to='minecraft/skins/',
        verbose_name=_('Skin'),
        blank=True, null=True
    )
    cape = FileField(
        upload_to='minecraft/capes/',
        verbose_name=_('Cape'),
        blank=True, null=True
    )
    coins = DecimalField(
        _('Coins'),
        max_digits=10,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"UserXLMine {self.user_id}=>{self.coins} coins"


class MinecraftSession(ACreatedAtMixin):
    user = ForeignKey('core.User', CASCADE, 'minecraft_sessions')
    access_token = CharField(max_length=100, unique=True)
    client_token = CharField(max_length=100)
    last_server_id = CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"MC-Session for {self.user} with token {self.access_token}"
