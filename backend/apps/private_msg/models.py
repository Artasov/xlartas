import os
from datetime import datetime, timedelta
from django.db import models
from django.utils import timezone

from xLLIB_v1 import random_str


def format_private_file_upload(instance, filename):
    return os.path.join("files/private_msg/", random_str(4, alphabet='0123456789') + '_' + filename)


def NowPlusSevenDays():
    return timezone.now() + timedelta(days=7)


def GeneratePrivateKey():
    return random_str(40)


class PrivateMsg(models.Model):
    msg = models.TextField(blank=True, default=None, null=True)
    file = models.FileField(upload_to=format_private_file_upload, blank=True)
    voice_msg = models.FileField(upload_to=format_private_file_upload, blank=True)
    key = models.CharField(max_length=40, default=GeneratePrivateKey)
    created_at = models.DateTimeField(auto_now_add=True)
    date_for_del = models.DateTimeField(default=NowPlusSevenDays)
