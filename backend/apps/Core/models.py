from django.contrib.auth.models import AbstractUser
from django.db.models import (
    BigIntegerField, ImageField, CharField, BooleanField,
    DecimalField, Model, TextChoices, CASCADE, DateTimeField,
    ForeignKey, FileField, OneToOneField, SET_NULL
)
from django.utils import timezone

from xLLIB_v1 import random_str


def GenerateCustomKey():
    return random_str(20)


def GenerateReferralCode():
    return random_str(10)


class User(AbstractUser):
    avatar = ImageField(upload_to='images/users/avatar/', blank=True)
    secret_key = CharField(max_length=20, default=GenerateCustomKey)
    referral_code = CharField(max_length=10, default=GenerateReferralCode)
    hw_id = CharField(max_length=600, blank=True, null=True, default=None)
    is_confirmed = BooleanField(default=False)
    balance = DecimalField(decimal_places=2, max_digits=8, default=0)


class DiscordUser(Model):
    discord_id = BigIntegerField()
    user = OneToOneField(User, on_delete=CASCADE)


class Theme(Model):
    name = CharField(max_length=100)
    bg_image = ImageField(upload_to='images/theme/background/')


class ConfirmationCode(Model):
    class CodeType(TextChoices):
        signUp = 'signUp'
        resetPassword = 'resetPassword'

    user = ForeignKey(User, on_delete=CASCADE)
    code = CharField(max_length=40)
    type = CharField(max_length=30, choices=CodeType.choices, default=CodeType.resetPassword)
    expired_at = DateTimeField()
    created_at = DateTimeField(auto_now_add=True)

    async def is_expired(self):
        return self.expired_at < timezone.now()


class CompanyData(Model):
    param = CharField(max_length=50)
    value = CharField(max_length=200)


class PasswordReset(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    code = ForeignKey(ConfirmationCode, on_delete=SET_NULL, null=True)
    created_at = DateTimeField(auto_now_add=True)


class File(Model):
    name = CharField(max_length=50)
    file = FileField(upload_to='files/', blank=True)

    def __str__(self):
        return f'{self.name}'
