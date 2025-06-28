import logging
from datetime import datetime

import pytz
from dateutil import parser
from django.conf import settings

logger = logging.getLogger('global')

TIMEZONES_ABBREVIATIONS = {
    'Europe/London': 'GMT',  # GMT или BST в зависимости от времени года
    'Europe/Moscow': 'MSK',
    'Europe/Paris': 'CET',  # CET или CEST
    'America/New_York': 'EST',  # EST или EDT
    'America/Los_Angeles': 'PST',  # PST или PDT
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Europe/Berlin': 'CET',  # CET или CEST
    'Europe/Kiev': 'EET',  # EET или EEST
    'Australia/Sydney': 'AEST',
}


def get_timezone_abbreviation(timezone_name: str) -> str | None:
    """
    Возвращает трехбуквенное сокращение таймзоны по ее полному названию.

    :param timezone_name: Полное название таймзоны, например, 'Europe/Moscow'
    :return: Трехбуквенное сокращение, например, 'MSK' или None, если таймзона не найдена
    """
    # Попытка найти сокращение в заранее определенном словаре

    abbreviation = TIMEZONES_ABBREVIATIONS.get(timezone_name)
    if abbreviation:
        return abbreviation

    # Если нет в словаре, пытаемся получить сокращение программно
    try:
        timezone = pytz.timezone(timezone_name)
        # Используем текущую дату и время для получения корректного сокращения
        now = datetime.now(timezone)
        abbreviation = now.strftime('%Z')
        return abbreviation
    except pytz.UnknownTimeZoneError:
        # Таймзона не распознана
        return None


def get_timezone(user_timezone):
    """
    Возвращает объект часового пояса.
    Если user_timezone не задан или не валиден, возвращает settings.TIME_ZONE.
    """
    try:
        if user_timezone: return pytz.timezone(user_timezone)
    except pytz.UnknownTimeZoneError as e:
        logger.info(f'Неизвестный часовой пояс: {user_timezone}. Ошибка: {e}')
    return pytz.timezone(settings.TIME_ZONE)


def parse_and_convert(date_str, user_timezone):
    """
    Парсит строку даты, устанавливает часовой пояс и возвращает datetime объект.
    """
    try:
        dt = parser.isoparse(date_str)
    except (ValueError, TypeError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=pytz.UTC)
    user_tz = get_timezone(user_timezone)
    try:
        dt = dt.astimezone(user_tz)
        return dt
    except Exception as exc:  # noqa
        logger.warning('Failed to convert timezone: %s', exc)
        return None
