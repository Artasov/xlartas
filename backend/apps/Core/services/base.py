import asyncio
import functools
import hashlib
import hmac
import json
import logging
import os
import time
import traceback
import urllib
import urllib.parse
import urllib.request
from datetime import timedelta, datetime
from time import time
from typing import Optional, Tuple

import aiohttp
from django.conf import settings
from django.core.handlers.asgi import ASGIRequest
from django.core.handlers.wsgi import WSGIRequest
from django.db import transaction
from django.http import HttpResponseNotAllowed, HttpResponse
from django.utils.timezone import now
from rest_framework import status
from rest_framework.response import Response

from apps.Core.async_django import AsyncAtomicContextManager
from apps.Core.error_messages import USER_EMAIL_NOT_EXISTS, USER_USERNAME_NOT_EXISTS
from apps.Core.models.user import User
from apps.Core.services.mail.base import send_text_email

log = logging.getLogger('base')


def get_timedelta(**kwargs) -> datetime:
    return now() + timedelta(**kwargs)


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


def decrease_by_percentage(num: int, percent: int) -> int:
    return round(num * (1 - percent / 100))


def get_plural_form_number(number: int, forms: tuple):
    """get_plural_form_number(minutes, ('минуту', 'минуты', 'минут'))"""
    if number % 10 == 1 and number % 100 != 11:
        return forms[0]
    elif 2 <= number % 10 <= 4 and (number % 100 < 10 or number % 100 >= 20):
        return forms[1]
    else:
        return forms[2]


async def get_user_by_email_or_name(identifier: str) -> Tuple[Optional[User], str]:
    """Retrieve User by email or username. Returns User and empty string or None and error message."""
    try:
        lookup_field = 'email' if '@' in identifier else 'username'
        return await User.objects.aget(**{lookup_field: identifier}), ''
    except User.DoesNotExist:
        return None, USER_EMAIL_NOT_EXISTS if '@' in identifier else USER_USERNAME_NOT_EXISTS


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


def allowed_only(allowed_methods):
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            if request.method in allowed_methods:
                return view_func(request, *args, **kwargs)
            else:
                return HttpResponseNotAllowed(allowed_methods)

        return wrapped_view

    return decorator


def aallowed_only_async(allowed_methods) -> callable:
    def decorator(view_func) -> callable:
        async def wrapped_view(request, *args, **kwargs) -> HttpResponse:
            if request.method in allowed_methods:
                if asyncio.iscoroutinefunction(view_func):
                    return await view_func(request, *args, **kwargs)
                else:
                    return view_func(request, *args, **kwargs)
            else:
                return HttpResponseNotAllowed(allowed_methods)

        return wrapped_view

    return decorator


def forbidden_with_login(fn) -> callable:
    @functools.wraps(fn)
    def inner(request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return fn(request, *args, **kwargs)

    return inner


def aforbidden_with_login(fn) -> callable:
    @functools.wraps(fn)
    async def inner(request, *args, **kwargs) -> Response:
        if request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return await fn(request, *args, **kwargs)

    return inner


def acontroller(name=None, log_time=False) -> callable:
    def decorator(fn) -> callable:
        @functools.wraps(fn)
        async def inner(request: ASGIRequest, *args, **kwargs):
            fn_name = name or fn.__name__
            log.info(f'Async Controller: {request.method} | {fn_name}')
            if log_time:
                start_time = time()

            if settings.DEBUG:
                async with AsyncAtomicContextManager():
                    return await fn(request, *args, **kwargs)
            else:
                try:
                    if log_time:
                        end_time = time()
                        elapsed_time = end_time - start_time
                        log.info(f"Execution time of {fn_name}: {elapsed_time:.2f} seconds")
                    async with AsyncAtomicContextManager():
                        return await fn(request, *args, **kwargs)
                except Exception as e:
                    log.critical(f"ERROR in {fn_name}: {str(e)}", exc_info=True)
                    send_text_email(
                        subject='SERVER ERROR',
                        to_email=settings.DEVELOPER_EMAIL,
                        text=f"error_message: {str(e)}\n"
                             f"traceback:\n{traceback.format_exc()}"
                    )
                    raise e

        return inner

    return decorator


def controller(name=None, log_time=False) -> callable:
    def decorator(fn) -> callable:
        @functools.wraps(fn)
        def inner(request: WSGIRequest, *args, **kwargs):
            fn_name = name or fn.__name__
            log.info(f'Sync Controller: {request.method} | {fn_name}')
            if log_time:
                start_time = time()

            if settings.DEBUG:
                with transaction.atomic():
                    return fn(request, *args, **kwargs)
            else:
                try:
                    if log_time:
                        end_time = time()
                        elapsed_time = end_time - start_time
                        log.info(f"Execution time of {fn_name}: {elapsed_time:.2f} seconds")
                    with transaction.atomic():
                        return fn(request, *args, **kwargs)
                except Exception as e:
                    log.critical(f"ERROR in {fn_name}: {str(e)}", exc_info=True)
                    send_text_email(
                        subject='Ошибка на сервере',
                        to_email=settings.DEVELOPER_EMAIL,
                        text=f"error_message: {str(e)}\n"
                             f"traceback:\n{traceback.format_exc()}"
                    )
                    raise e

        return inner

    return decorator


async def aget_object_or_404(klass, *args, **kwargs):
    return await klass.objects.aget(*args, **kwargs)
