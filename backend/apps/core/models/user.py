# core/models/user.py
import uuid

from adjango.fields import AManyToManyField
from adjango.models.base import AAbstractUser, AModel
from adjango.models.choices import ATextChoices
from django.db.models import (
    CharField, BooleanField,
    DecimalField, EmailField, DateField
)
from django.utils.translation import gettext_lazy as _
from imagekit.models import ProcessedImageField
from phonenumber_field.modelfields import PhoneNumberField
from pilkit.processors import ResizeToFit
from timezone_field import TimeZoneField

from apps.core.managers.user import UserManager
from apps.core.models.choices import Gender
from apps.core.services.user import UserService, generate_random_username
from utils.pictures import CorrectOrientation


def generate_custom_key() -> str:
    return uuid.uuid4().hex[:20]


def generate_referral_code() -> str:
    return uuid.uuid4().hex[:10]


class Role(AModel):
    class Variant(ATextChoices):
        MINE_DEV = 'MINE-DEV', _('Minecraft Developer')

    name = CharField(max_length=20, unique=True, choices=Variant.choices)


class User(AAbstractUser, UserService):
    objects = UserManager()

    password = CharField(_('Password'), max_length=128, blank=True)
    email = EmailField(_('Email'), blank=True, null=True, db_index=True)
    phone = PhoneNumberField(null=True, blank=True, db_index=True)
    middle_name = CharField(_('Middle name'), max_length=150, blank=True)
    birth_date = DateField(_('Birth date'), null=True, blank=True)
    gender = CharField(_('Gender'), max_length=10, choices=Gender.choices, blank=True, null=True)
    avatar = ProcessedImageField(
        verbose_name=_('Avatar'), upload_to='user/images/avatar/',
        processors=(ResizeToFit(500, 500), CorrectOrientation()),
        format='JPEG', options={'quality': 70}, null=True, blank=True
    )
    roles = AManyToManyField('Role', related_name='users', blank=True)
    timezone = TimeZoneField(default='UTC')
    is_email_confirmed = BooleanField(_('Is email confirmed'), default=False)
    is_phone_confirmed = BooleanField(_('Is phone confirmed'), default=False)
    is_test = BooleanField(_('Is test'), default=False)
    secret_key = CharField(max_length=20, default=generate_custom_key)
    referral_code = CharField(max_length=10, default=generate_referral_code)
    hw_id = CharField(max_length=600, blank=True, null=True, default=None)
    is_confirmed = BooleanField(default=False)
    balance = DecimalField(decimal_places=2, max_digits=8, default=0)

    def __str__(self):
        return f'{self.full_name if self.full_name else self.username}:{self.id}'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = generate_random_username()
        super().save(*args, **kwargs)
