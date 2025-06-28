import asyncio
import base64
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.exceptions import ChannelFull
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

User = get_user_model()

# ≈ 20 fps.  При большем значении будет выше задержка, при меньшем — выше нагрузка.
FLUSH_DELAY = 1 / 20


class ScreenStreamConsumer(AsyncJsonWebsocketConsumer):
    """
    **Desktop-клиент (xlmacros) ➜ сервер**

        • бинарные WebSocket-сообщения —   один JPEG-кадр.
        • text-сообщения JSON: {'type': 'settings', 'width': …, 'height': …}

    **Сервер ➜ браузеры**

        • text-сообщение: {'type': 'screen.frame', 'data': '<base64-jpeg>'}

    Авторизация — та же, что и у `MacroControlConsumer`:
        ws://<host>/ws/screen-stream/?username=<login>&secret_key=<key>
    """

    # ---------- connect / disconnect ----------

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self._latest_frame: bytes | None = None
        self._flush_task: asyncio.Task | None = None

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
        await self.channel_layer.group_add(f'screen_{user.id}', self.channel_name)
        await self.accept()

        # буфер последнего кадра
        self._latest_frame: bytes | None = None
        self._flush_task = None

    async def disconnect(self, code):
        if hasattr(self, 'user'):
            await self.channel_layer.group_discard(f'screen_{self.user.id}', self.channel_name)
        if self._flush_task:
            self._flush_task.cancel()

    @sync_to_async
    def _get_user(self, username, secret_key):
        try:
            return User.objects.get(username=username, secret_key=secret_key)
        except User.DoesNotExist:
            return None

    # ---------- receive (desktop → server) ----------

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        # ----- пришёл бинарный JPEG-кадр -----
        if bytes_data:
            self._latest_frame = bytes_data  # TODO: Instance attribute _latest_frame defined outside __init__
            if not self._flush_task:
                self._flush_task = asyncio.create_task(
                    self._flush_frame())  # TODO: Instance attribute _flush_task defined outside __init__
            return

        # ----- текстовые meta-сообщения (пока не используем) -----
        # тут могут быть размеры кадра, FPS и т. д.
        # сейчас просто игнорируем
        return

    # ---------- helpers ----------

    async def _flush_frame(self):
        """
        Раз в FLUSH_DELAY берём самый свежий кадр из буфера
        и рассылаем его всем веб-клиентам.
        """
        try:
            while True:
                if not self._latest_frame:
                    break
                b64 = base64.b64encode(self._latest_frame).decode()
                await self._safe_group_send({
                    'type': 'screen.frame',
                    'data': b64,
                })
                self._latest_frame = None
                await asyncio.sleep(FLUSH_DELAY)
        finally:
            self._flush_task = None

    async def _safe_group_send(self, message: dict):
        try:
            await self.channel_layer.group_send(f'screen_{self.user.id}', message)
        except ChannelFull:
            # канал переполнен — просто отбросим кадр
            pass

    # ---------- handlers (browser ← server) ----------

    async def screen_frame(self, event):
        """
        Отдаём кадр браузеру.  Т.к. web-socket в браузере не понимает dict,
        превращаем обратно в JSON-строку.
        """
        await self.send_json(event)
