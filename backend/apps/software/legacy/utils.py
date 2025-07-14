from __future__ import annotations

from typing import Optional

from rest_framework import status
from rest_framework.response import Response

from apps.core.models import User

JSON_HEADERS = {"Content-Type": "application/json"}

async def get_user_by_credentials(username: str, secret_key: str) -> Optional[User]:
    """Return user if credentials are valid else ``None``."""
    try:
        return await User.objects.aget(username=username, secret_key=secret_key)
    except User.DoesNotExist:
        return None


def json_response(data: dict, *, status_code: int = status.HTTP_200_OK) -> Response:
    """Return DRF ``Response`` with common headers."""
    return Response(data, status=status_code, headers=JSON_HEADERS)
