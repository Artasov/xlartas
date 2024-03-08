import hashlib
import json
import os

from adrf.decorators import api_view
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from django.contrib.auth import login
from django.db import IntegrityError
from django.shortcuts import render, redirect
from django.utils.crypto import get_random_string
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.Core.models import *
from apps.Core.services.services import telegram_verify_hash


class GoogleLogin(SocialLoginView):
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter


@api_view(['GET'])
@permission_classes([AllowAny])
def telegram_auth(request):
    if request.method == 'GET':
        data = request.GET.dict()

        if not telegram_verify_hash(data):
            return Response({'error': 'Invalid hash'}, status=400)

        del data['auth_date']

        telegram_id = data['id']
        username = data['username']
        first_name = data['first_name']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = User.objects.create_user(username=username, first_name=first_name)
            SocialAccount.objects.create(user=user, uid=telegram_id, provider='telegram', extra_data=json.dumps(data))

        # Токены для пользователя
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


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
