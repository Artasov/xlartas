# captcha/yandex.py
import json
import logging

import requests
from django.conf import settings

log = logging.getLogger(__name__)


def check_captcha(token: str, user_ip: str) -> bool:
    resp = requests.get(
        'https://smartcaptcha.yandexcloud.net/validate',
        {
            'secret': settings.YANDEX_RECAPTCHA_SECRET_KEY,
            'token': token,
            'ip': user_ip  # Нужно передать IP пользователя.
            # Как правильно получить IP зависит от вашего фреймворка и прокси.
            # Например, в Flask это может быть request.remote_addr
        },
        timeout=1
    )
    server_output = resp.content.decode()
    if resp.status_code != 200:
        log.error(
            'Allow access due to an error: code=%s; message=%s',
            resp.status_code,
            server_output,
        )
        return False
    return json.loads(server_output)['status'] == 'ok'


def captcha_required(controller):
    async def wrapper(request, *args, **kwargs):
        captcha_token = request.data.get('captchaToken', '')
        request.is_captcha_valid = check_captcha(
            token=captcha_token,
            user_ip=request.ip
        )
        return await controller(request, *args, **kwargs)

    return wrapper
