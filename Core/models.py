from datetime import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models

from APP_shop.qiwi import reject_bill
from xLLIB_v1 import random_str


def GenerateCustomKey():
    return random_str(20)


def GenerateReferralCode():
    return random_str(10)


class User(AbstractUser):
    custom_key = models.CharField(max_length=20, default=GenerateCustomKey)
    referral_code = models.CharField(max_length=10, default=GenerateReferralCode)
    HWID = models.CharField(max_length=300, blank=True, null=True, default=None)

    def reject_waiting_bills(self):
        from APP_shop.models import Bill
        user_waiting_bills_ = Bill.objects.filter(
            user=self, status=Bill.BillStatus.WAITING)
        for bill in user_waiting_bills_:
            response = reject_bill(bill.qiwi_bill_id)
            if 'errorCode' in response:
                return False
            elif response['status']['value'] == Bill.BillStatus.REJECTED:
                bill.status = Bill.BillStatus.REJECTED
                bill.save()
        return True



class UnconfirmedUser(models.Model):
    username = models.CharField(max_length=50, blank=True)
    password = models.CharField(max_length=250, blank=True)
    email = models.EmailField(max_length=320, blank=True)
    confirmation_code = models.CharField(max_length=50, blank=True, null=True, default=None)
    date_created = models.DateTimeField(blank=True, null=True, default=datetime.now)


class UnconfirmedPasswordReset(models.Model):
    email = models.EmailField(max_length=320, blank=True)
    confirmation_code = models.CharField(max_length=50, blank=True, null=True, default=None)
    date_created = models.DateTimeField(blank=True, null=True, default=datetime.now)


class File(models.Model):
    name = models.CharField(max_length=50)
    file = models.FileField(upload_to='files/', blank=True)

    def __str__(self):
        return f'{self.name}'
