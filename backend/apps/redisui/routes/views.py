# redisui/routes/views.py
from django.urls import path

from apps.redisui.controllers.views import (
    redis_overview, delete_redis_key
)

app_name = 'redisui'

urlpatterns = [
    path('', redis_overview, name='redis_overview'),
    path('delete/', delete_redis_key, name='delete_redis_key'),
]
