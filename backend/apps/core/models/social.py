from adjango.models import AModel
from django.db.models import (
    Model, CASCADE, OneToOneField
)

from apps.core.models.user import User


class DiscordUser(AModel):
    user = OneToOneField(User, on_delete=CASCADE, unique=True)
