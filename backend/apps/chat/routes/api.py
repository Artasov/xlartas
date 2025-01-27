# chat/routes/api.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.chat.controllers.room import RoomViewSet, personal_room_with_user

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')

app_name = 'chat'

urlpatterns = [
    path('', include(router.urls)),
    path('rooms/personal/with/<int:user_id>/', personal_room_with_user)
]
