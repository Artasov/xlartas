# redisui/controllers/views.py
import pickle

import redis
from adjango.decorators import controller
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render

# Подключение к Redis без автоматического декодирования
redis_cache = redis.StrictRedis.from_url(settings.REDIS_CACHE_URL, decode_responses=False)
redis_broker = redis.StrictRedis.from_url(settings.REDIS_BROKER_URL, decode_responses=False) if hasattr(settings,
                                                                                                        'REDIS_BROKER_URL') else None

ctrl_settings = settings.REDISUI_CONTROLLERS_SETTINGS


def decode_redis_value(value):
    """Попытка декодировать значение в строку."""
    try:
        return value.decode('utf-8')
    except (UnicodeDecodeError, AttributeError):
        return repr(value)  # Если не удается декодировать, возвращаем представление объекта


def get_redis_value(redis_client, key):
    """Получение значения ключа в зависимости от его типа."""
    key_type = redis_client.type(key).decode('utf-8')

    if key_type == 'string':
        value = redis_client.get(key)
        # Попробуем распаковать значение с помощью pickle, если оно сериализовано
        try:
            # Предполагаем, что данные сериализованы, и пытаемся их распаковать
            return pickle.loads(value)
        except (pickle.UnpicklingError, AttributeError, ValueError):
            # Если это не сериализованные данные, просто вернем как строку или попытаемся преобразовать в число
            value = decode_redis_value(value)
            try:
                if '.' in value:
                    return float(value)
                else:
                    return int(value)
            except ValueError:
                return value  # Если это не число, возвращаем как строку
    elif key_type == 'list':
        return redis_client.lrange(key, 0, -1)  # Получение всех элементов списка
    elif key_type == 'set':
        return redis_client.smembers(key)  # Получение всех элементов множества
    elif key_type == 'hash':
        return redis_client.hgetall(key)  # Получение всех полей и значений хэша
    elif key_type == 'zset':
        return redis_client.zrange(key, 0, -1, withscores=True)  # Получение всех элементов отсортированного множества
    else:
        return f"Unsupported type: {key_type}"


def list_redis_keys(request, redis_client):
    """Отображение всех ключей и их значений с учетом их типов."""
    keys = redis_client.keys('*')
    redis_data = {key.decode('utf-8'): get_redis_value(redis_client, key) for key in keys}
    return redis_data


@controller(**ctrl_settings)
def redis_overview(request):
    """Главная страница для отображения ключей из кэша и брокера."""
    context = {}
    if redis_cache:
        context['cache_keys'] = list_redis_keys(request, redis_cache)
    if redis_broker:
        context['broker_keys'] = list_redis_keys(request, redis_broker)
    return render(request, 'redisui/redis_overview.html', context)


@controller(**ctrl_settings)
def delete_redis_key(request):
    """Асинхронное удаление ключа из Redis."""
    if request.method == 'POST':
        key = request.POST.get('key')
        client_type = request.POST.get('client_type')

        if not key or not client_type:
            return JsonResponse({'status': 'error', 'message': 'Key or client_type is missing'}, status=400)

        if client_type == 'cache' and redis_cache:
            redis_cache.delete(key)
        elif client_type == 'broker' and redis_broker:
            redis_broker.delete(key)
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid client type'}, status=400)

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
