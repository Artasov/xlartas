# social_oauth/providers/yandex/model.py
from adjango.models import AModel
from django.db.models import OneToOneField, CASCADE, CharField, EmailField
from django.utils.translation import gettext_lazy as _


class YandexUser(AModel):
    user = OneToOneField('core.User', CASCADE, unique=True, verbose_name=_('User'))
    yandex_id = CharField(max_length=255, unique=True, verbose_name=_('Yandex ID'))
    email = EmailField(verbose_name=_('Email'))

    class Meta:
        verbose_name = _('Yandex User')
        verbose_name_plural = _('Yandex Users')
