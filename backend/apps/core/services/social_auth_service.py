import logging
from typing import TypedDict, Optional

import aiohttp
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.async_django import arelated
from apps.core.exceptions.user import UserExceptions
from apps.core.models.social import DiscordUser
from apps.core.models.user import User

log = logging.getLogger('global')


class JwtData(TypedDict):
    access: str
    refresh: str


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


def get_jwt_by_user(user: settings.AUTH_USER_MODEL) -> JwtData:
    refresh = RefreshToken.for_user(user)
    return JwtData(access=str(refresh.access_token), refresh=str(refresh))


async def get_discord_user_by_code(code: str) -> DiscordUserResponse:
    """
    https://developers.google.com/identity/protocols/oauth2?hl=ru#2.-obtain-an-access-token-from-the-google-authorization-server.
    :param code: Is sent by Discord to authenticate the user.
    :return: discord user profile as DiscordUserResponse dict by discord oauth2 code.
    """
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


async def get_google_user_by_code(code: str) -> GoogleUserResponse:
    """
    https://developers.google.com/identity/protocols/oauth2?hl=ru#2.-obtain-an-access-token-from-the-google-authorization-server.
    :param code: Is sent by Google to authenticate the user.
    :return: google user profile as GoogleUserResponse dict by google oauth2 code.
    """
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


async def get_jwt_by_google_oauth2_code(code: str) -> JwtData:
    """
    :param code: Is sent by Google to authenticate the user.
    :return: JwtData dictionary with access and refresh keys for the user received via oauth2 code.
    """
    user_dict: GoogleUserResponse = await get_google_user_by_code(code=code)
    email = user_dict.get('email')
    if not email: raise UserExceptions.GoogleEmailWasNotProvided()
    try:
        user = await User.objects.aget(email=email)
    except User.DoesNotExist:
        user = await User.objects.acreate(
            email=email,
            username=email.split('@')[0],
            is_confirmed=True
        )
    return get_jwt_by_user(user)


async def get_jwt_by_discord_oauth2_code(code) -> JwtData:
    """
    :param code: Is sent by Discord to authenticate the user.
    :return: JwtData dictionary with access and refresh keys for the user received via oauth2 code.
    """
    user_dict: DiscordUserResponse = await get_discord_user_by_code(code)
    username = user_dict.get('username')
    email = user_dict.get('email')
    social_user_id = int(user_dict.get('id', -1))

    if not username: raise UserExceptions.DiscordUsernameWasNotProvided()
    if not email: raise UserExceptions.DiscordEmailWasNotProvided()
    if social_user_id == -1: raise UserExceptions.DiscordUserIdWasNotProvided()

    try:
        discord_user = await DiscordUser.objects.aget(id=social_user_id)
        user = await arelated(discord_user, 'user')
    except DiscordUser.DoesNotExist:
        try:
            user = await User.objects.aget(email=email)
        except User.DoesNotExist:
            user = await User.objects.acreate(
                username=username,
                email=email,
                is_confirmed=True
            )
        await DiscordUser.objects.acreate(id=social_user_id, user=user)
    return get_jwt_by_user(user)
