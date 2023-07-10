import functools
import hashlib
import hmac
import json
import os
import time
import traceback
import urllib
from typing import Optional, Tuple, List

from django.conf import settings
from django.contrib.auth import logout
from django.db import transaction
from django.shortcuts import render, redirect

from APP_mailing.services.services import send_text_email
from Core.error_messages import USER_EMAIL_NOT_EXISTS, USER_USERNAME_NOT_EXISTS
from Core.models import User


def reCAPTCHA_validation(request):
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


def int_decrease_by_percentage(num: int, percent: int) -> int:
    if percent == 0:
        return num
    return round(num - (num / 100 * float(percent)))


def render_invalid(request, err_msg: str, redirect_field_name: str):
    return render(request, 'Core/invalid.html',
                  {'invalid': err_msg, 'redirect': redirect_field_name})


def get_plural_form_number(number: int, forms: tuple):
    """get_plural_form_number(minutes, ('минуту', 'минуты', 'минут'))"""
    if number % 10 == 1 and number % 100 != 11:
        return forms[0]
    elif 2 <= number % 10 <= 4 and (number % 100 < 10 or number % 100 >= 20):
        return forms[1]
    else:
        return forms[2]


def get_user_by_email_or_name(email_or_name: str) -> Tuple[Optional[User], str]:
    """Если пользователь не найден вернется None и строка ошибки, иначе User и пустая строка"""
    user_ = None
    error = ''
    if '@' in email_or_name:
        try:
            user_ = User.objects.get(email=email_or_name)
        except User.DoesNotExist:
            error = USER_EMAIL_NOT_EXISTS
    else:
        try:
            user_ = User.objects.get(username=email_or_name)
        except User.DoesNotExist:
            error = USER_USERNAME_NOT_EXISTS

    return user_, error


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


def base_view(fn):
    """transaction.atomic() и хук исключений самого высокого уровня"""

    @functools.wraps(fn)
    def inner(request, *args, **kwargs):
        if settings.DEBUG:
            with transaction.atomic():
                return fn(request, *args, **kwargs)
        else:
            try:
                with transaction.atomic():
                    return fn(request, *args, **kwargs)
            except Exception as e:
                send_text_email(
                    subject='Ошибка на сервере',
                    to_email=settings.DEVELOPER_EMAIL,
                    text=f"error_message: {str(e)}\n"
                         f"traceback:\n{traceback.format_exc()}"
                )
                return render_invalid(request, str(e))

    return inner


def forbidden_with_login(fn, redirect_field_name: str = None):
    """logout if user.is_authenticated, with redirect if necessary"""

    @functools.wraps(fn)
    def inner(request, *args, **kwargs):
        if request.user.is_authenticated:
            logout(request)
            if redirect_field_name is not None:
                return redirect(redirect_field_name)
            return fn(request, *args, **kwargs)
        else:
            return fn(request, *args, **kwargs)

    return inner
