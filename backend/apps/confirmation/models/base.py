# confirmation/models/base.py
from random import randint

from adjango.models import APolymorphicModel
from adjango.models.mixins import ACreatedAtIndexedMixin
from django.db.models import (
    ForeignKey, CharField, DateTimeField,
    CASCADE, BooleanField, PositiveIntegerField
)
from django.utils.translation import gettext_lazy as _

from apps.confirmation.services.base import ConfirmationCodeService
from apps.confirmation.services.email import EmailConfirmationCodeService
from apps.confirmation.services.phone import PhoneConfirmationCodeService
from apps.core.models.user import User


def generate_short_code(): return randint(1000, 10000)


class ConfirmationCode(APolymorphicModel, ACreatedAtIndexedMixin,
                       ConfirmationCodeService):
    from apps.confirmation.managers.base import ConfirmationCodeManager
    objects = ConfirmationCodeManager()

    user = ForeignKey(User, on_delete=CASCADE, related_name='confirmation_codes', verbose_name=_('User'))
    code = PositiveIntegerField(default=generate_short_code, verbose_name=_('Code'))
    can_confirmed_by_link = BooleanField(default=False, verbose_name=_('Can be Confirmed by Link'))
    action = CharField(max_length=20, verbose_name=_('Action'))  # One of all actions
    is_used = BooleanField(default=False, verbose_name=_('Is Used'))
    expired_at = DateTimeField(verbose_name=_('Expiration Date'))

    class Meta:
        verbose_name = _('Confirmation Code')
        verbose_name_plural = _('Confirmation Codes')

    def __str__(self):
        return f'{self.user} {self.action} {self.code}'


class EmailConfirmationCode(EmailConfirmationCodeService, ConfirmationCode):
    class Meta:
        verbose_name = _('Email Confirmation Code')
        verbose_name_plural = _('Email Confirmation Codes')

    def __str__(self):
        return f'{self.user} {self.action} {self.code}'


class PhoneConfirmationCode(PhoneConfirmationCodeService, ConfirmationCode):
    class Meta:
        verbose_name = _('Phone Confirmation Code')
        verbose_name_plural = _('Phone Confirmation Codes')

    def __str__(self):
        return f'{self.user} {self.action} {self.code}'


class ConfirmationMethod:
    EMAIL = 'email', EmailConfirmationCode
    PHONE = 'phone', PhoneConfirmationCode
