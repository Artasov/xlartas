from django.urls import re_path

from apps.software.consumers.macros import MacroControlConsumer

websocket_urlpatterns = [
    re_path(r'^ws/macro-control/$', MacroControlConsumer.as_asgi()),
]
