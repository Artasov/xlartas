from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from xLLIB_v1 import random_str


def GenerateCustomKey():
    return random_str(20)


def GenerateReferralCode():
    return random_str(10)


class User(AbstractUser):
    secret_key = models.CharField(max_length=20, default=GenerateCustomKey)
    referral_code = models.CharField(max_length=10, default=GenerateReferralCode)
    hw_id = models.CharField(max_length=600, blank=True, null=True, default=None)
    is_confirmed = models.BooleanField(default=False)


class ConfirmationCode(models.Model):
    class CodeType(models.TextChoices):
        signUp = 'signUp'
        resetPassword = 'resetPassword'
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=40)
    type = models.CharField(max_length=30, choices=CodeType.choices, default=CodeType.resetPassword)
    expired_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return self.expired_at < timezone.now()


class CompanyData(models.Model):
    param = models.CharField(max_length=50)
    value = models.CharField(max_length=200)


class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.ForeignKey(ConfirmationCode, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class File(models.Model):
    name = models.CharField(max_length=50)
    file = models.FileField(upload_to='files/', blank=True)

    def __str__(self):
        return f'{self.name}'
