# apps/xlmine/routes/yggdrasil.py
from django.urls import path

from apps.xlmine.controllers.yggdrasil import (
    profile_view, has_joined_view, join_server_view,
    signout_view, invalidate_view, validate_view,
    refresh_view, authenticate_view, base, auth_server
)

urlpatterns = [
    path('', base, name='base'),
    path('authserver', auth_server, name='auth_server'),
    path('authenticate', authenticate_view, name='ygg_authenticate'),
    path('refresh', refresh_view, name='ygg_refresh'),
    path('validate', validate_view, name='ygg_validate'),
    path('invalidate', invalidate_view, name='ygg_invalidate'),
    path('signout', signout_view, name='ygg_signout'),

    # SessionServer endpoints:
    path('sessionserver/session/minecraft/join', join_server_view, name='ygg_join'),
    path('sessionserver/session/minecraft/hasJoined', has_joined_view, name='ygg_has_joined'),
    # Дополнительно (необязательно):
    path('sessionserver/session/minecraft/profile/<str:player_uuid>', profile_view, name='ygg_profile'),
]
