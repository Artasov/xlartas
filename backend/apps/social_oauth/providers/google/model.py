# social_oauth/providers/google/model.py
from adjango.models import AModel
from django.db.models import OneToOneField, CASCADE, CharField, EmailField
from django.utils.translation import gettext_lazy as _


class GoogleUser(AModel):
    user = OneToOneField('core.User', CASCADE, unique=True, verbose_name=_('User'))
    google_id = CharField(max_length=255, unique=True, verbose_name=_('Google ID'))
    email = EmailField(verbose_name=_('Email'))

    class Meta:
        verbose_name = _('Google User')
        verbose_name_plural = _('Google Users')
