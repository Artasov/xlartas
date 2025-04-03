from adjango.models import AModel
from django.db.models import OneToOneField, DecimalField, CASCADE

from django.utils.translation import gettext_lazy as _


class UserXLMine(AModel):
    """
    Хранит данные о «майнкрафт-части» пользователя, в том числе текущее
    количество коинов. Связь 1 к 1 с основной моделью User.
    """
    user = OneToOneField('core.User', CASCADE, 'xlmine', primary_key=True)
    coins = DecimalField(
        _('Coins'),
        max_digits=10,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"UserXLMine {self.user_id}=>{self.coins} coins"
