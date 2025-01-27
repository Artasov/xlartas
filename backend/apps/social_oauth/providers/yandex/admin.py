# social_oauth/providers/yandex/admin.py
from django.contrib import admin

from apps.social_oauth.models import YandexUser


@admin.register(YandexUser)
class YandexUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'yandex_id')
    search_fields = ('user__username', 'yandex_id')
