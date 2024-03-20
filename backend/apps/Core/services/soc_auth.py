import requests
from django.conf import settings
from typing import TypedDict, Union

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


def get_user(url, access_token: str) -> Union[DiscordUserResponse, GoogleUserResponse]:
    """ Get user by a bearer token """    
    headers={"Authorization": f"Bearer {access_token}"}
    user = requests.get(url, headers=headers)
    return user.json()


def get_discord_user_by_code(code: str) -> DiscordUserResponse:
    """ Get user by a discord oauth2 code 
        code - is string sent by discord to authenticate the user
        
        more: https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
    """
    data = {
        "grant_type": 'authorization_code',
        "code": code,
        "redirect_uri": settings.DISCORD_REDIRECT_URI
    }
    resp = requests.post("https://discord.com/api/v10/oauth2/token", data=data,
                         auth=(settings.DISCORD_CLIENT_ID, settings.DISCORD_CLIENT_SECRET))
    user : DiscordUserResponse = get_user("https://discord.com/api/v10/users/@me", resp.json().get("access_token"))
    return user


def get_google_user_by_token(code: str) -> GoogleUserResponse:
    """ Get google user profile by a google oauth2 code 
        code - is string sent by google to authenticate the user 
        
        more: https://developers.google.com/identity/protocols/oauth2?hl=ru#2.-obtain-an-access-token-from-the-google-authorization-server.
    """
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "grant_type": 'authorization_code',
        "code": code,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }

    resp = requests.post("https://accounts.google.com/o/oauth2/token", data=data)
    user : GoogleUserResponse = get_user("https://www.googleapis.com/oauth2/v1/userinfo", resp.json().get("access_token"))
    return user
