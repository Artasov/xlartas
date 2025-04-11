# apps/xlmine/consumers/eco.py
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class BalanceConsumer(AsyncJsonWebsocketConsumer):
    """
    Консьюмер, аутентифицирующийся по JWT (access токен),
    далее слушает изменения по монетам.
    """

    async def connect(self):
        # Пример: ждём токен в query string: ?token=<JWT_ACCESS>
        self.jwt_token = self.scope['query_string'].decode('utf-8').replace('token=', '')
        if not self.jwt_token:
            await self.close()
            return

        # Проверяем JWT
        try:
            self.user = await self._get_user(self.jwt_token)
        except AuthenticationFailed:
            await self.close()
            return

        # Подключаемся
        await self.accept()
        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        # Можно отправить initial-сообщение
        await self.send_json({
            'event': 'connected',
            'detail': f'Подключено к балансу юзера {self.user.username}'
        })

    async def disconnect(self, close_code):
        # Уходим из группы
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        """
        Если хотим принимать сообщения от клиента,
        например, content = {"action": "ping"} => ответ "pong".
        """
        action = content.get('action')
        if action == 'ping':
            await self.send_json({"event": "pong"})
        # Доп. действия не обязательны.

    async def balance_update(self, event):
        """
        Вызывается, когда кто-то сделает group_send с типом "balance_update".
        """
        coins = event.get('coins')
        await self.send_json({
            'event': 'balance_update',
            'coins': coins
        })

    @database_sync_to_async
    def _get_user(self, token_str):
        """
        Декодирование access-токена через simplejwt.
        Можно использовать AccessToken(token_str), проверить user_id, найти пользователя.
        """
        try:
            access = AccessToken(token_str)
            user_id = access['user_id']
            user = User.objects.get(pk=user_id)
            return user
        except Exception as e:
            raise AuthenticationFailed('JWT Token invalid.')
