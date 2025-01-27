# social_oauth/providers/discord/model.py
from adjango.models import AModel
from django.db.models import OneToOneField, CASCADE, CharField, EmailField
from django.utils.translation import gettext_lazy as _


class DiscordUser(AModel):
    user = OneToOneField('core.User', CASCADE, unique=True, verbose_name=_('User'))
    discord_id = CharField(max_length=255, unique=True, verbose_name=_('Discord ID'))
    email = EmailField(verbose_name=_('Email'))

    class Meta:
        verbose_name = _('Discord User')
        verbose_name_plural = _('Discord Users')
