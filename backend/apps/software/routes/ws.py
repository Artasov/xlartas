# software/routes/ws.py
from django.urls import re_path

from apps.software.consumers.macros import MacroControlConsumer
from apps.software.consumers.screen import ScreenStreamConsumer

websocket_urlpatterns = [
    re_path(r'^ws/macro-control/$', MacroControlConsumer.as_asgi()),
    re_path(r'^ws/screen-stream/$', ScreenStreamConsumer.as_asgi()),
]
