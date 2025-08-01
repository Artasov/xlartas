# chat/routes/ws.py
from django.urls import re_path

from apps.chat.consumers.chat import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>\w+)/$', ChatConsumer.as_asgi()),
]
