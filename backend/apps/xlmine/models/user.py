from adjango.models import AModel
from django.db.models import OneToOneField, DecimalField, CASCADE, DateTimeField, CharField, ForeignKey
import uuid as uuid_
from django.utils.translation import gettext_lazy as _


class UserXLMine(AModel):
    """
    Хранит данные о «майнкрафт-части» пользователя, в том числе текущее
    количество коинов. Связь 1 к 1 с основной моделью User.
    """
    user = OneToOneField('core.User', CASCADE, related_name='xlmine_user', primary_key=True)
    uuid = CharField(max_length=100, default=uuid_.uuid4, unique=True, editable=False)
    coins = DecimalField(
        _('Coins'),
        max_digits=10,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"UserXLMine {self.user_id}=>{self.coins} coins"


class MinecraftSession(AModel):
    user = ForeignKey('core.User', CASCADE, 'minecraft_sessions')
    access_token = CharField(max_length=100, unique=True)
    client_token = CharField(max_length=100)
    last_server_id = CharField(max_length=100, blank=True, null=True)
    created_at = DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"MC-Session for {self.user} with token {self.access_token}"
