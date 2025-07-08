# software/consumers/base.py
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.exceptions import ChannelFull
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseSoftwareConsumer(AsyncJsonWebsocketConsumer):
    """Base consumer with username/secret_key auth and group helpers."""

    group_prefix: str = 'user'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.group_name = None

    async def connect(self):
        if self.scope['user'].is_anonymous:
            qs = parse_qs(self.scope['query_string'].decode())
            username = qs.get('username', [None])[0]
            secret_key = qs.get('secret_key', [None])[0]
            if not username or not secret_key:
                await self.close(code=4002)
                return
            user = await self._get_user(username, secret_key)
            if user is None:
                await self.close(code=4003)
                return
        else:
            user = self.scope['user']

        self.user = user
        self.group_name = f'{self.group_prefix}_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    @sync_to_async
    def _get_user(self, username, secret_key):
        try:
            return User.objects.get(username=username, secret_key=secret_key)
        except User.DoesNotExist:
            return None

    async def _safe_group_send(self, message: dict):
        try:
            await self.channel_layer.group_send(self.group_name, message)
        except ChannelFull:
            pass
