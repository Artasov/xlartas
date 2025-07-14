# core/routes/ws.py

from apps.chat.routes.ws import websocket_urlpatterns as chat_ws
from apps.converter.routes.ws import websocket_urlpatterns as converter_ws
from apps.software.routes.ws import websocket_urlpatterns as software_ws
from apps.xlmine.routes.ws import websocket_urlpatterns as xlmine_ws

websocket_urlpatterns = []
websocket_urlpatterns += software_ws
websocket_urlpatterns += converter_ws
websocket_urlpatterns += chat_ws
websocket_urlpatterns += xlmine_ws
