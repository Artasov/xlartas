# social_oauth/controllers/base.py
from adjango.adecorators import aatomic, acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.exceptions.base import CoreException
from apps.social_oauth.oauth_factory import OAuthFactory
from apps.social_oauth.providers.discord.model import DiscordUser
from apps.social_oauth.providers.google.model import GoogleUser
from apps.social_oauth.providers.vk.model import VKUser
from apps.social_oauth.providers.yandex.model import YandexUser


@aatomic
@acontroller('Get all social accounts of the current user')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_user_social_accounts(request):
    user = request.user
    social_accounts = {
        'google': await GoogleUser.objects.filter(user=user).aexists(),
        'discord': await DiscordUser.objects.filter(user=user).aexists(),
        'vk': await VKUser.objects.filter(user=user).aexists(),
        'yandex': await YandexUser.objects.filter(user=user).aexists(),
    }
    return Response(social_accounts)


@aatomic
@acontroller('Handle OAuth2 callback')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def oauth2_callback(request, provider_name: str) -> Response:
    code = request.GET.get('code')
    if not code:
        raise CoreException.SomethingGoWrong()
    provider = OAuthFactory.get_provider(provider_name)
    user_data = await provider.get_user_data(code)
    if request.user.is_authenticated:
        # Привязываем аккаунт к текущему пользователю
        await provider.link_user_account(user=request.user, user_data=user_data)
        return Response({'detail': 'Социальный аккаунт успешно привязан.'})
    else:
        return Response(await provider.get_jwt_for_user(user_data))
