# core/auth/ws_jwt.py
# ---------------------------------------------------------
# Auth-middleware for **Channels 4** that turns a JWT (query
# string ?token=… or header “Authorization: Bearer …”)
# into scope['user'] exactly like Django-session auth does.
# ---------------------------------------------------------
from __future__ import annotations

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.tokens import UntypedToken


@database_sync_to_async
def _get_user(user_id: int | str | None):
    if not user_id:
        return AnonymousUser()
    User = get_user_model()
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware:  # ← ASGI-spec
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInst(scope, self)


class JWTAuthMiddlewareInst:  # ← scope wrapper
    def __init__(self, scope, middleware):
        self.scope = dict(scope)
        self.middleware = middleware

    async def __call__(self, receive, send):
        token = self._extract_token(self.scope)
        user = await self._authenticate(token)
        self.scope['user'] = user
        inner = self.middleware.inner(self.scope)
        return await inner(receive, send)

    # ---------- helpers --------------------------------------------------

    @staticmethod
    def _extract_token(scope) -> str | None:
        # 1)  Authorization: Bearer <jwt>
        for name, value in scope.get('headers', []):
            if name == b'authorization' and value.lower().startswith(b'bearer '):
                return value.split()[1].decode()

        # 2)  ?token=<jwt>  |  ?access=<jwt>
        qs = parse_qs(scope.get('query_string', b'').decode())
        for key in ('token', 'access'):
            if key in qs:
                return qs[key][0]

        return None

    @staticmethod
    async def _authenticate(token: str | None):
        if not token:
            return AnonymousUser()
        try:
            # signature / exp validation
            UntypedToken(token)  # noqa
            data = TokenBackend(algorithm='HS256').decode(token, verify=True)  # noqa
            return await _get_user(data.get('user_id'))
        except Exception:  # noqa
            return AnonymousUser()
