# xlmine/utils/session.py
from __future__ import annotations

from adrf.requests import AsyncRequest


def get_skin_url(xlmine_user, request: AsyncRequest) -> str | None:
    """Return absolute skin URL or ``None`` if not set."""
    if getattr(xlmine_user, "skin", None):
        url = request.build_absolute_uri(xlmine_user.skin.url)
        return url.replace("http://", "https://")
    return None


async def build_profile(user, skin_url: str | None) -> dict:
    """Return the Yggdrasil user profile structure."""
    user_uuid = await user.xlmine_uuid()
    return {
        "id": user_uuid,
        "username": user.username,
        "properties": [{"name": "preferredLanguage", "value": "ru"}],
        "skin": skin_url,
    }
