# apps/xlmine/routing.py
from django.urls import re_path

from apps.xlmine.consumers.eco import BalanceConsumer

websocket_urlpatterns = [
    re_path(r'ws/xlmine/balance/$', BalanceConsumer.as_asgi()),
]
