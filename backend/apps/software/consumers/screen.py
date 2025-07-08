# software/consumers/screen.py
import asyncio
import base64

from .base import BaseSoftwareConsumer

# ≈ 20 fps.  При большем значении будет выше задержка, при меньшем — выше нагрузка.
FLUSH_DELAY = 1 / 20


class ScreenStreamConsumer(BaseSoftwareConsumer):
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

    group_prefix = 'screen'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._latest_frame: bytes | None = None
        self._flush_task: asyncio.Task | None = None

    async def connect(self):
        await super().connect()
        if not self.user:
            return

        # буфер последнего кадра
        self._latest_frame: bytes | None = None
        self._flush_task = None

    async def disconnect(self, code):
        if self._flush_task:
            self._flush_task.cancel()
        await super().disconnect(code)

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

    # ---------- handlers (browser ← server) ----------

    async def screen_frame(self, event):
        """
        Отдаём кадр браузеру.  Т.к. web-socket в браузере не понимает dict,
        превращаем обратно в JSON-строку.
        """
        await self.send_json(event)
