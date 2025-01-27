# social_oauth/oauth_factory.py
from apps.social_oauth.oauth_provider import OAuthProvider
from apps.social_oauth.providers.discord.provider import DiscordOAuthProvider
from apps.social_oauth.providers.google.provider import GoogleOAuthProvider
from apps.social_oauth.providers.vk.provider import VKOAuthProvider
from apps.social_oauth.providers.yandex.provider import YandexOAuthProvider


class OAuthFactory:
    providers = {
        'google': GoogleOAuthProvider(),
        'discord': DiscordOAuthProvider(),
        'yandex': YandexOAuthProvider(),
        'vk': VKOAuthProvider(),
    }

    @staticmethod
    def get_provider(provider_name: str) -> OAuthProvider:
        if provider_name not in OAuthFactory.providers:
            raise ValueError(f"Unknown OAuth provider: {provider_name}")
        return OAuthFactory.providers[provider_name]
