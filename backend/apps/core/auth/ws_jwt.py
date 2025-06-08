"""
Query-string JWT auth-middleware for Django Channels.

Клиент (браузер или Qt- приложение) подключается к
    ws(s)://host/ws/macro-control/?token=<JWT>
Middleware извлекает токен, валидирует его через SimpleJWT
и проставляет scope['user'].
Если токена нет или он невалидный – пользователь остаётся Anonymous.
"""
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import UntypedToken


class QueryJWTAuthMiddleware(BaseMiddleware):
    """
    Дополняет стандартную AuthMiddleware, извлекая JWT из query-param «token».
    """

    async def __call__(self, scope, receive, send):
        # по-умолчанию аноним
        scope["user"] = AnonymousUser()

        query_string = scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]

        if token:
            try:
                payload = UntypedToken(token)  # проверяем подпись / срок действия
                user_id = payload.get("user_id")
                if user_id:
                    user = await database_sync_to_async(
                        get_user_model().objects.get
                    )(id=user_id)
                    scope["user"] = user
            except (TokenError, InvalidToken, get_user_model().DoesNotExist):
                # остаёмся анонимом
                pass

        return await super().__call__(scope, receive, send)
