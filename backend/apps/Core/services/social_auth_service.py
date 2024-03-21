from typing import TypedDict, Optional

import aiohttp
from asgiref.sync import sync_to_async
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

from apps.Core.models import User, DiscordUser


class DiscordUserResponse(TypedDict):
    # API Date on 21.03.24
    id: str
    username: str
    avatar: Optional[str]
    discriminator: str
    public_flags: int
    premium_type: int
    flags: int
    banner: Optional[str]
    accent_color: Optional[int]
    global_name: str
    avatar_decoration_data: Optional[str]
    banner_color: Optional[str]
    mfa_enabled: bool
    locale: str
    email: str
    verified: bool


class GoogleUserResponse(TypedDict):
    # API Date on 21.03.24
    sub: str
    name: str
    given_name: Optional[str]
    family_name: Optional[str]
    picture: Optional[str]
    email: str
    email_verified: bool
    locale: Optional[str]


def get_jwt_by_user(user: settings.AUTH_USER_MODEL) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


async def get_discord_user_by_code(code: str) -> DiscordUserResponse:
    async with aiohttp.ClientSession() as session:
        async with session.post(
                url='https://discord.com/api/v10/oauth2/token',
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                data={
                    "grant_type": 'authorization_code',
                    "code": code,
                    "redirect_uri": settings.DISCORD_REDIRECT_URI
                },
                auth=aiohttp.BasicAuth(
                    settings.DISCORD_CLIENT_ID,
                    settings.DISCORD_CLIENT_SECRET
                )
        ) as resp:
            resp.raise_for_status()
            response_data = await resp.json()
            access_token = response_data['access_token']

        async with session.get('https://discord.com/api/v10/users/@me', headers={
            'Authorization': f'Bearer {access_token}',
        }) as user_resp:
            user_resp.raise_for_status()
            user_data = await user_resp.json()
    return DiscordUserResponse(**user_data)


async def get_google_user_by_token(code: str) -> GoogleUserResponse:
    async with aiohttp.ClientSession() as session:
        async with session.post(
                url='https://oauth2.googleapis.com/token',
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "grant_type": 'authorization_code',
                    "code": code,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                }
        ) as resp:
            resp.raise_for_status()
            response_data = await resp.json()
            access_token = response_data['access_token']

        async with session.get('https://www.googleapis.com/oauth2/v3/userinfo', headers={
            'Authorization': f'Bearer {access_token}',
        }) as user_resp:
            user_resp.raise_for_status()
            user_data = await user_resp.json()
    return GoogleUserResponse(**user_data)


async def get_jwt_by_google_oauth2_token(token) -> dict[str, str]:
    user_dict: GoogleUserResponse = await get_google_user_by_token(token)
    try:
        user = await User.objects.aget(email=user_dict.get('email'))
    except User.DoesNotExist:
        user = await User.objects.acreate(
            email=user_dict.get('email'),
            username=user_dict.get('email').split('@')[0]
        )
    return get_jwt_by_user(user)


async def get_jwt_by_discord_oauth2_code(code) -> dict[str, str]:
    user_dict: DiscordUserResponse = await get_discord_user_by_code(code)
    try:
        discord_user = await DiscordUser.objects.aget(id=int(user_dict.get('id')))
        user = await sync_to_async(getattr)(discord_user, 'user', None)
    except DiscordUser.DoesNotExist:
        user = await User.objects.acreate(username=user_dict.get('username'))
        await DiscordUser.objects.acreate(id=int(user_dict.get('id')), user=user)
    return get_jwt_by_user(user)
