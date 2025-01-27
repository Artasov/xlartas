# social_oauth/models.py
# We import the necessary models from providers.

from apps.social_oauth.providers.discord.model import DiscordUser
from apps.social_oauth.providers.google.model import GoogleUser
from apps.social_oauth.providers.vk.model import VKUser
from apps.social_oauth.providers.yandex.model import YandexUser
