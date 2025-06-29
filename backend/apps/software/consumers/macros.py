# software/consumers/macros.py
import asyncio
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.exceptions import ChannelFull
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

User = get_user_model()

FLUSH_DELAY = 1 / 60  # ≈60 fps


class MacroControlConsumer(AsyncJsonWebsocketConsumer):
    """
    ws://<host>/ws/macro-control/?username=<login>&secret_key=<key>

    Клиент → сервер
      {'type': 'mouse_move',  'dx': …, 'dy': …}
      {'type': 'mouse_click', 'button': 'left' | 'middle' | 'right'}
      {'type': 'mouse_scroll','dy': …}
      {'type': 'key_press',   'key': …}
      {'macro': '<old-style-macro-name>'}

    Сервер ретранслирует события всем десктоп-клиентам группы «user_<id>».
    """

    # ---------- connect / disconnect ----------

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self._mouse_acc = {'dx': 0, 'dy': 0}
        self._flush_task = None

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
        await self.channel_layer.group_add(f'user_{user.id}', self.channel_name)
        await self.accept()

        # буфер для коалессации мыши
        self._mouse_acc = {'dx': 0, 'dy': 0}
        self._flush_task = None

    async def disconnect(self, code):
        if hasattr(self, 'user'):
            await self.channel_layer.group_discard(f'user_{self.user.id}', self.channel_name)
        if self._flush_task:
            self._flush_task.cancel()

    @sync_to_async
    def _get_user(self, username, secret_key):
        try:
            return User.objects.get(username=username, secret_key=secret_key)
        except User.DoesNotExist:
            return None

    # ---------- receive ----------

    async def receive_json(self, content, **kwargs):
        msg_type = content.get('type')

        # ----- мышь: движение -----
        if msg_type == 'mouse_move':
            self._mouse_acc['dx'] += int(content.get('dx', 0))
            self._mouse_acc['dy'] += int(content.get('dy', 0))
            if not self._flush_task:
                self._flush_task = asyncio.create_task(self._flush_mouse())
            return

        # ----- мышь: клик -----
        if msg_type == 'mouse_click':
            await self._safe_group_send({
                'type': 'mouse.click',
                'button': content.get('button', 'left')
            })
            return

        # ----- мышь: скролл -----
        if msg_type == 'mouse_scroll':
            await self._safe_group_send({
                'type': 'mouse.scroll',
                'dy': int(content.get('dy', 0))
            })
            return

        # ----- клавиатура -----
        if msg_type == 'key_press':
            await self._safe_group_send({
                'type': 'key.press',
                'key': content.get('key', '')
            })
            return

        # ----- старые макросы -----
        macro_name = content.get('macro')
        if macro_name:
            await self._safe_group_send({
                'type': 'macro.command',
                'macro': macro_name
            })

    # ---------- helpers ----------

    async def _flush_mouse(self):
        try:
            while True:
                dx, dy = self._mouse_acc['dx'], self._mouse_acc['dy']
                if dx or dy:
                    await self._safe_group_send({
                        'type': 'mouse.move',
                        'dx': dx,
                        'dy': dy,
                    })
                    self._mouse_acc = {'dx': 0, 'dy': 0}
                else:
                    break
                await asyncio.sleep(FLUSH_DELAY)
        finally:
            self._flush_task = None

    async def _safe_group_send(self, message: dict):
        try:
            await self.channel_layer.group_send(f'user_{self.user.id}', message)
        except ChannelFull:
            pass

    # ---------- handlers для десктоп-клиента ----------

    async def mouse_move(self, event):
        await self.send_json({'type': 'mouse_move', 'dx': event['dx'], 'dy': event['dy']})

    async def mouse_click(self, event):
        await self.send_json({'type': 'mouse_click', 'button': event['button']})

    async def mouse_scroll(self, event):
        await self.send_json({'type': 'mouse_scroll', 'dy': event['dy']})

    async def key_press(self, event):
        await self.send_json({'type': 'key_press', 'key': event['key']})

    async def macro_command(self, event):
        await self.send_json({'macro': event['macro']})
