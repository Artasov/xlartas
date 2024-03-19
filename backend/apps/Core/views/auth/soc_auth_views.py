import hashlib
import os

from django.contrib.auth import login
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from rest_framework_simplejwt.tokens import RefreshToken

from apps.Core.models import DiscordUser, User
from apps.Core.services.soc_auth import get_discord_user_by_code, get_google_user_by_token


def discord_oauth2(request):
    """ View for discord oauth2 """
    code = request.GET.get('code')
    discord_data = get_discord_user_by_code(code)

    try:
        print(discord_data)
        discord_user = DiscordUser.objects.get(discord_id=int(discord_data.get('id')))
        user = discord_user.user
    except DiscordUser.DoesNotExist:
        user = User(username=discord_data.get('username'))
        user.save()
        discord_user = DiscordUser(discord_id=int(discord_data.get('id')), user=user)
        discord_user.save()

    refresh = RefreshToken.for_user(user)

    return JsonResponse({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, safe=False)


def google_oauth2(request):
    """ View for google oauth2 """
    code = request.GET.get('code')
    google_data = get_google_user_by_token(code)

    try:
        user = User.objects.get(email=google_data.get('email'))
    except User.DoesNotExist:
        user = User(email=google_data.get('email'), username=google_data.get('email').split('@')[0])
        user.save()

    refresh = RefreshToken.for_user(user)

    return JsonResponse({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, safe=False)


# def telegram_auth(request):
#     if request.method == 'GET':
#         data = request.GET.dict()
#
#         if not telegram_verify_hash(data):
#             pass
#             # return render_invalid(request, 'Invalid hash', 'signup')
#
#         del data['auth_date']
#
#         telegram_id = data['id']
#         username = data['username']
#         first_name = data['first_name']
#
#         try:
#             User.objects.get(username=username)
#             username = username + get_random_string(10)
#         except User.DoesNotExist:
#             pass
#
#         if SocialAccount.objects.filter(uid=telegram_id, provider='telegram').exists():
#             user_ = SocialAccount.objects.get(uid=telegram_id, provider='telegram').user
#             login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
#         else:
#             user_ = User.objects.create(username=username, first_name=first_name)
#             SocialAccount.objects.create(user=user_, uid=telegram_id,
#                                          provider='telegram',
#                                          extra_data=json.dumps(data))
#             login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
#         return redirect('main')


def vk_auth(request):
    uid = request.GET.get('uid')
    first_name = request.GET.get('first_name')
    last_name = request.GET.get('last_name')
    hash = request.GET.get('hash')
    hash_valid = hashlib.md5(str(os.getenv('VK_CLIENT_ID') + uid + os.getenv('VK_SECRET')).encode()).hexdigest()

    if not uid or hash != hash_valid:
        return render(request, 'Core/registration/signup.html', context={
            'invalid': 'Vk auth invalid, pls contact us'})
    try:
        user_, created = User.objects.get_or_create(id=uid,
                                                    first_name=first_name,
                                                    last_name=last_name,
                                                    username=first_name)
    except IntegrityError:
        user_ = User.objects.create(id=uid,
                                    first_name=first_name,
                                    last_name=last_name,
                                    username=first_name + get_random_string(10))

    login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
    return redirect('main')
