from django.db import models

from apps.Core.models import User


class RefLinking(models.Model):
    inviter = models.ForeignKey(User, related_name='referral', on_delete=models.SET_NULL, null=True)
    referral = models.ForeignKey(User, related_name='inviter', on_delete=models.SET_NULL, null=True)
    given = models.BooleanField(default=False)
