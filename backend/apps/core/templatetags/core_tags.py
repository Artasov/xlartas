# core/templatetags/core_tags.py
from utils.log import get_global_logger

from django import template

from utils.timezone import parse_and_convert, get_timezone_abbreviation

register = template.Library()
logger = get_global_logger()


@register.filter
def convert_timezone(date_str, user_timezone):
    """
    Преобразует строку даты в объект datetime, переводит в указанный часовой пояс и форматирует.
    Использование в шаблоне:
    {{ consultation.date|convert_timezone:user.timezone }}
    """
    dt = parse_and_convert(date_str, user_timezone)
    return dt.strftime('%d.%m.%Y %H:%M') if dt else ''


@register.filter
def convert_timezone_time(date_str, user_timezone):
    """
    Преобразует строку даты в объект datetime, переводит в указанный часовой пояс и форматирует время.
    Использование в шаблоне:
    {{ consultation.date|convert_timezone_time:user.timezone }}
    """
    dt = parse_and_convert(date_str, user_timezone)
    return dt.strftime('%H:%M') if dt else ''


@register.filter
def timezone_abbr(timezone_name):
    """
    Пользовательский фильтр для преобразования полного названия таймзоны в ее аббревиатуру.
    """
    abbr = get_timezone_abbreviation(timezone_name)
    return abbr if abbr else timezone_name
