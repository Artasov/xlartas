# core/services/phone/base.py
import logging

import aiohttp
import requests
from adjango.utils.common import traceback_str
from django.conf import settings


class SMSSendException(Exception):
    """Исключение для ошибок при отправке SMS."""
    pass


class SMSServiceUnavailableException(SMSSendException):
    """Исключение, если сервис недоступен."""
    pass


log = logging.getLogger('global')


async def asend_sms(phone: str, message: str):
    """Асинхронная отправка SMS на указанный номер телефона"""
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get('https://smsc.ru/sys/send.php', params={
                'login': settings.SMS_LOGIN,
                'psw': settings.SMS_PASSWORD,
                'phones': phone,
                'charset': 'utf-8',
                'mes': message
            }) as response:
                if response.status != 200:
                    text = await response.text()
                    log.critical(f'SMS sending error: {phone} : {text}')
                    raise SMSSendException(f'SMS sending error: {text}')
                return await response.text()
        except aiohttp.ClientError as e:
            trace = traceback_str(e)
            log.critical(f'Connection error when sending SMS: {trace}')
            raise SMSSendException(f'Connection error: {trace}')


def send_sms(phone: str, message: str):
    """Отправляет SMS message на указанный phone"""
    if not phone:
        log.critical(f'SMS Номер телефона не указан {phone} : {message}')
        raise SMSSendException('Номер телефона не указан')
    if not message:
        log.critical(f'SMS Сообщение не указано {phone} : {message}')
        raise SMSSendException('Сообщение не указано')
    if len(message) > 70:
        log.critical(f'SMS Сообщение слишком длинное {phone} : {message}')
        message = message[:70]
    try:
        response = requests.get('https://smsc.ru/sys/send.php', params={
            'login': settings.SMS_LOGIN,
            'psw': settings.SMS_PASSWORD,
            'phones': phone,
            'charset': 'utf-8',
            'mes': message
        }, timeout=10)
        if 'ERROR' in response.text:
            log.critical(f'SMS отправка не удалась: {phone} : {response.text}')
            raise SMSSendException(f'SMS отправка не удалась: {response.text}')
        response.raise_for_status()
    except requests.Timeout:
        log.critical(f'SMS сервис недоступен: {phone}')
        raise SMSServiceUnavailableException(f'Сервис SMS недоступен для телефона {phone}')
    except requests.RequestException as e:
        log.critical(f'Ошибка при отправке SMS: {phone} : {e}')
        raise SMSSendException(f'Ошибка при отправке SMS: {e}')
    except Exception:
        raise

    log.info(f'SMS успешно отправлено: {phone} : {message}')
    return response.content
