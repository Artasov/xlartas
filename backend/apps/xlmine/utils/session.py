# xlmine/utils/session.py
from __future__ import annotations

from apps.core.models import User
from apps.xlmine.models.user import UserXLMine


def get_skin_url(xlmine_user: UserXLMine, request) -> str | None:
    """Return absolute skin URL or ``None`` if not set."""
    if getattr(xlmine_user, "skin", None):
        url = request.build_absolute_uri(xlmine_user.skin.url)
        return url.replace("http://", "https://")
    return None


async def build_profile(user: User, skin_url: str | None) -> dict:
    """Return the Yggdrasil user profile structure."""
    user_uuid = await user.service.xlmine_uuid()
    return {
        "id": user_uuid,
        "username": user.username,
        "properties": [{"name": "preferredLanguage", "value": "ru"}],
        "skin": skin_url,
    }
