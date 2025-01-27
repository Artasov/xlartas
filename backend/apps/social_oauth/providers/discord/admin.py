# social_oauth/providers/discord/admin.py
from django.contrib import admin

from apps.social_oauth.models import DiscordUser


@admin.register(DiscordUser)
class DiscordUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'discord_id')
    search_fields = ('user__username', 'discord_id')
