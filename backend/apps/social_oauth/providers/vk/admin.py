# social_oauth/providers/vk/admin.py
from django.contrib import admin

from apps.social_oauth.models import VKUser


@admin.register(VKUser)
class VKUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'vk_id')
    search_fields = ('user__username', 'vk_id')
