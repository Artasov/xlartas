import requests
from django.conf import settings
from typing import TypedDict

class DiscordUserResponse(TypedDict):
    id: int
    username: str
    global_name: str
    avatar: str
    locale: str
    
class GoogleUserResponse(TypedDict):
    id: int
    email: str
    name: str
    given_name: str
    family_name: str
    picture: str
    gender: str
    


def get_discord_user_by_code(code: str) -> DiscordUserResponse:
    """ Get user by a discord oauth2 code """

    data = {
        "grant_type": 'authorization_code',
        "code": code,
        "redirect_uri": settings.DISCORD_REDIRECT_URI
    }
    resp = requests.post("https://discord.com/api/v10/oauth2/token", data=data,
                         auth=(int(settings.DISCORD_CLIENT_ID), settings.DISCORD_CLIENT_SECRET))

    access_token = resp.json().get("access_token")

    user = requests.get("https://discord.com/api/v10/users/@me", headers={
        "Authorization": f"Bearer {access_token}",
    })

    print(user.json())

    return user.json()


def get_google_user_by_token(code: str) -> GoogleUserResponse:
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "grant_type": 'authorization_code',
        "code": code,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }

    resp = requests.post("https://accounts.google.com/o/oauth2/token", data=data)

    access_token = resp.json().get("access_token")

    user = requests.get("https://www.googleapis.com/oauth2/v1/userinfo", headers={
        "Authorization": f"Bearer {access_token}",
    })

    print(user)

    return user.json()
