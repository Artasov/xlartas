# utils/common.py
import hashlib
import hmac
import json
import os
import time
import urllib
from typing import Any, Generator

import aiohttp
from django.apps import apps
from django.conf import settings


def get_models_list() -> Generator[str, Any, None]:
    """
    Функция возвращает список строк вида 'app.Model' для всех зарегистрированных моделей.
    """
    models = apps.get_models()
    return (f'{model._meta.app_label}.{model.__name__}' for model in models)  # noqa


def google_captcha_validation(request):
    recaptcha_response = request.POST.get('g-recaptcha-response')
    url = 'https://www.google.com/recaptcha/api/siteverify'
    values = {
        'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
        'response': recaptcha_response
    }
    data = urllib.parse.urlencode(values).encode()  # noqa
    req = urllib.request.Request(url, data=data)  # noqa
    response = urllib.request.urlopen(req)  # noqa
    result = json.loads(response.read().decode())
    return result


def telegram_verify_hash(auth_data):
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


async def check_recaptcha_is_valid(recaptcha_response: str) -> bool:
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
