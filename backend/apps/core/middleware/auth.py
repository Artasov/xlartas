# core/middleware/auth.py
from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

from utils.log import get_global_logger

User = get_user_model()
log = get_global_logger()


async def get_user_from_token(token):
    try:
        return await User.objects.aget(id=AccessToken(token)['user_id'])
    except Exception:
        log.exception('Error retrieving user from token')
        raise


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token')
        if token:
            token = token[0]
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)
