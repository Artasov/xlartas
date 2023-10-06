import hashlib
import os

from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import authenticate, login
from django.db import IntegrityError
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.crypto import get_random_string
from Core.models import *
from Core.services.services import base_view, render_invalid, telegram_verify_hash


@base_view
def telegram_auth(request):
    if request.method == 'GET':
        data = request.GET.dict()

        if not telegram_verify_hash(data):
            return render_invalid(request, 'Invalid hash', 'signup')

        del data['auth_date']

        telegram_id = data['id']
        username = data['username']
        first_name = data['first_name']

        try:
            User.objects.get(username=username)
            username = username + get_random_string(10)
        except User.DoesNotExist:
            pass

        if SocialAccount.objects.filter(uid=telegram_id, provider='telegram').exists():
            user_ = SocialAccount.objects.get(uid=telegram_id, provider='telegram').user
            login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
        else:
            user_ = User.objects.create(username=username, first_name=first_name)
            SocialAccount.objects.create(user=user_, uid=telegram_id,
                                         provider='telegram',
                                         extra_data=json.dumps(data))
            login(request, user_, backend='django.contrib.auth.backends.ModelBackend')
        return redirect('main')


@base_view
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
