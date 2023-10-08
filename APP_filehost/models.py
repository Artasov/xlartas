import os

from django.conf import settings
from django.db import models
from datetime import datetime, timedelta

from django.utils import timezone
from transliterate import translit

from xLLIB_v1 import random_str


def format_filehost_upload(instance, filename):
    filename = translit(str(filename), language_code='ru', reversed=True).replace(' ', '_')
    return os.path.join("files/filehost/", random_str(10, alphabet='0123456789') + '_' + str(filename))


def NowPlus30Days():
    return timezone.now() + timedelta(days=30)


def GenerateUploadKey():
    return random_str(30)


class Upload(models.Model):
    name = models.CharField(max_length=50)
    key = models.CharField(max_length=30, default=GenerateUploadKey)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    size = models.IntegerField(blank=True, default=None, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_delete = models.DateTimeField(default=NowPlus30Days)


class UploadedFile(models.Model):
    upload = models.ForeignKey('Upload', on_delete=models.CASCADE, blank=True)
    file = models.FileField(upload_to=format_filehost_upload, blank=True)
    name = models.CharField(max_length=200, blank=True, default=None, null=True)
    size = models.IntegerField(blank=True, default=None, null=True)
