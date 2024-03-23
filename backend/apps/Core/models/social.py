from django.db.models import (
    Model, CASCADE, OneToOneField
)

from apps.Core.models.user import User


class DiscordUser(Model):
    user = OneToOneField(User, on_delete=CASCADE, unique=True)
