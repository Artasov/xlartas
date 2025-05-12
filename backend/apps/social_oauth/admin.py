# social_oauth/admin.py
from django.contrib.admin import ModelAdmin, register

from apps.social_oauth.providers.discord.model import DiscordUser
from apps.social_oauth.providers.google.model import GoogleUser
from apps.social_oauth.providers.vk.model import VKUser
from apps.social_oauth.providers.yandex.model import YandexUser


@register(DiscordUser)
class DiscordUserAdmin(ModelAdmin):
    list_display = ('user', 'discord_id', 'email')
    search_fields = ('discord_id', 'email', 'user__username')
    raw_id_fields = ('user',)


@register(GoogleUser)
class GoogleUserAdmin(ModelAdmin):
    list_display = ('user', 'google_id', 'email')
    search_fields = ('google_id', 'email', 'user__username')
    raw_id_fields = ('user',)


@register(VKUser)
class VKUserAdmin(ModelAdmin):
    list_display = ('user', 'vk_id', 'email')
    search_fields = ('vk_id', 'email', 'user__username')
    raw_id_fields = ('user',)


@register(YandexUser)
class YandexUserAdmin(ModelAdmin):
    list_display = ('user', 'yandex_id', 'email')
    search_fields = ('yandex_id', 'email', 'user__username')
    raw_id_fields = ('user',)
