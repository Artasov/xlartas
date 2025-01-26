import uuid

from django.contrib.auth.models import AbstractUser
from django.db.models import (
    ImageField, CharField, BooleanField,
    DecimalField, EmailField
)

from apps.core.managers.user import UserManager


def generate_custom_key() -> str:
    return uuid.uuid4().hex[:20]


def generate_referral_code() -> str:
    return uuid.uuid4().hex[:10]


class User(AbstractUser):
    objects = UserManager()

    email = EmailField(unique=True)
    avatar = ImageField(upload_to='images/users/avatar/', blank=True)
    secret_key = CharField(max_length=20, default=generate_custom_key)
    referral_code = CharField(max_length=10, default=generate_referral_code)
    hw_id = CharField(max_length=600, blank=True, null=True, default=None)
    is_confirmed = BooleanField(default=False)
    balance = DecimalField(decimal_places=2, max_digits=8, default=0)
