import hashlib
import hmac
import json
import logging
import os
import time
import urllib
import urllib.parse
import urllib.request
from datetime import timedelta, datetime
from time import time

import aiohttp
from django.conf import settings
from django.contrib.auth.models import Group
from django.utils.timezone import now

log = logging.getLogger('global')


def add_user_to_group(user, group_name):
    group, created = Group.objects.get_or_create(name=group_name)
    if user not in group.user_set.all():
        group.user_set.add(user)


def get_timedelta(**kwargs) -> datetime:
    return now() + timedelta(**kwargs)


def google_captcha_validation(request):
    """
    Проверяет валидность Google reCAPTCHA.

    @param request: Объект запроса, содержащий метаданные запроса.
    @return: Результат проверки reCAPTCHA в виде словаря.
    """
    recaptcha_response = request.POST.get('g-recaptcha-response')
    url = 'https://www.google.com/recaptcha/api/siteverify'
    values = {
        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
        'response': recaptcha_response
    }
    data = urllib.parse.urlencode(values).encode()
    req = urllib.request.Request(url, data=data)
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode())
    return result


def get_plural_form_number(number: int, forms: tuple):
    """
    Определяет правильную форму слова в зависимости от числа.

    @param number: Число, для которого нужно определить форму слова.
    @param forms: Кортеж из трех форм слова (например, ('минуту', 'минуты', 'минут')).
    @return: Правильная форма слова в зависимости от числа.
    """
    """get_plural_form_number(minutes, ('минуту', 'минуты', 'минут'))"""
    if number % 10 == 1 and number % 100 != 11:
        return forms[0]
    elif 2 <= number % 10 <= 4 and (number % 100 < 10 or number % 100 >= 20):
        return forms[1]
    else:
        return forms[2]


def telegram_verify_hash(auth_data):
    """
    Проверяет хэш данных аутентификации Telegram.

    @param auth_data: Словарь с данными аутентификации, полученными от Telegram.
    @return: True, если хэш действителен и данные не устарели, иначе False.
    """
    check_hash = auth_data['hash']

    del auth_data['hash']
    data_check_arr = []
    for key, value in auth_data.items():
        data_check_arr.append(f'{key}={value}')
    data_check_arr.sort()
    data_check_string = '\n'.join(data_check_arr)
    secret_key = hashlib.sha256(os.getenv('TELEGRAM_TOKEN').encode()).digest()
    hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if hash != check_hash:
        return False
    if time.time() - int(auth_data['auth_date']) > 86400:
        return False
    return True


async def check_google_captcha_is_valid(recaptcha_response: str) -> bool:
    if not recaptcha_response:
        return False

    url = 'https://www.google.com/recaptcha/api/siteverify'
    values = {
        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
        'response': recaptcha_response
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=values) as response:
            if response.status == 200:
                result = await response.json()
                return result.get('success', False)
            return False
