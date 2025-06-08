from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

User = get_user_model()


class MacroControlConsumer(AsyncJsonWebsocketConsumer):
    """
    Авторизация выполняется сразу при попытке handshake, через query-string:
        ws://<host>/ws/macro-control/?username=<login>&secret_key=<key>

    После успешного подключения клиент посылает только
        {"macro": "<name>"}
    а сервер ретранслирует это сообщение всем десктоп-клиентам
    того же пользователя (группа «user_<id>»).
    """

    async def connect(self):
        print('!1')
        if self.scope["user"].is_anonymous:
            print('!2')
            # --- разбираем query-string ---------------------------------------
            qs = parse_qs(self.scope["query_string"].decode())
            username = qs.get("username", [None])[0]
            secret_key = qs.get("secret_key", [None])[0]

            print('!3')
            if not username or not secret_key:
                await self.close(code=4002)  # креды не передали
                return

            print('!4')
            user = await self._get_user(username, secret_key)
            if user is None:
                await self.close(code=4003)  # неверные креды
                return
            print('!5')
        else:
            print('!6')
            user = self.scope["user"]
        self.user = user
        await self.channel_layer.group_add(f"user_{user.id}", self.channel_name)
        await self.accept()

    @sync_to_async
    def _get_user(self, username: str, secret_key: str):
        try:
            return User.objects.get(username=username, secret_key=secret_key)
        except User.DoesNotExist:
            return None

    async def disconnect(self, code):
        if hasattr(self, "user"):
            await self.channel_layer.group_discard(
                f"user_{self.user.id}", self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        """
        Клиент шлёт: {"macro": "<name>"}
        """
        macro_name = content.get("macro")
        if not macro_name:
            return

        await self.channel_layer.group_send(
            f"user_{self.user.id}",
            {"type": "macro.command", "macro": macro_name},
        )

    async def macro_command(self, event):
        """
        Отправка в десктоп-клиент:
            {"macro": "<name>"}
        """
        await self.send_json({"macro": event["macro"]})
