from django.urls import re_path

from apps.converter.consumers.conversion import ConversionConsumer

websocket_urlpatterns = [
    re_path(r'^ws/converter/(?P<conversion_id>\d+)/$', ConversionConsumer.as_asgi()),
]
