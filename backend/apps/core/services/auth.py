# core/services/auth.py
from typing import TypedDict

from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


class JWTPair(TypedDict):
    access: str
    refresh: str


def new_jwt_for_user(user: settings.AUTH_USER_MODEL) -> JWTPair:
    refresh = RefreshToken.for_user(user)
    return JWTPair(access=str(refresh.access_token), refresh=str(refresh))
