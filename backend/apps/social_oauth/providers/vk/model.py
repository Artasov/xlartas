# social_oauth/providers/vk/model.py
from adjango.models import AModel
from django.db.models import OneToOneField, CASCADE, CharField, EmailField
from django.utils.translation import gettext_lazy as _


class VKUser(AModel):
    user = OneToOneField('core.User', CASCADE, unique=True, verbose_name=_('User'))
    vk_id = CharField(max_length=255, unique=True, verbose_name=_('VK ID'))
    email = EmailField(verbose_name=_('Email'))

    class Meta:
        verbose_name = _('VK User')
        verbose_name_plural = _('VK Users')
