# core/controllers/health.py
import asyncio
import logging
import os
import platform
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from random import randint

import django
from adjango.adecorators import acontroller
from adjango.utils.common import traceback_str
from adrf.decorators import api_view as aapi_view
from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.management import call_command
from django.db import connections
from django.http import JsonResponse
from django_minio_backend import MinioBackend
from django_redis import get_redis_connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_503_SERVICE_UNAVAILABLE, HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_403_FORBIDDEN
)

from apps.core.tasks.test_tasks import test_task
from utils.decorators import staff_required

log = logging.getLogger('console')


@api_view(('GET',))
@permission_classes((AllowAny,))
def health(_request) -> Response:
    # Redis
    if not get_redis_connection():
        return Response('Redis is dead', HTTP_503_SERVICE_UNAVAILABLE)

    # Task
    if settings.INTENSIVE_HEALTH_TEST:
        test_task.delay(randint(1000, 10000))

    # Database
    try:
        connections['default'].cursor()
    except Exception:  # noqa
        return Response('Database is dead', HTTP_503_SERVICE_UNAVAILABLE)

    # Minio
    if settings.MINIO_USE:
        MB = MinioBackend()
        if not MB.is_minio_available():
            log.error('Minio is dead')
            log.error(MB.is_minio_available().details)
            log.error(f'MINIO_STATIC_FILES_BUCKET = {MB.MINIO_STATIC_FILES_BUCKET}')
            log.error(f'MINIO_MEDIA_FILES_BUCKET = {MB.MINIO_MEDIA_FILES_BUCKET}')
            log.error(f'base_url = {MB.base_url}')
            log.error(f'base_url_external = {MB.base_url_external}')
            log.error(f'HTTP_CLIENT = {MB.HTTP_CLIENT}')
            return Response('Minio is dead', HTTP_503_SERVICE_UNAVAILABLE)
    return Response('ok')


@acontroller('Get backend config')
@aapi_view(('GET',))
@permission_classes((IsAdminUser,))
async def backend_config(_):
    # Получение названий статических файлов из /static/css и /static/js
    static_dir = Path(settings.FRONTEND_DIR) / 'build' / 'static'
    css_path = static_dir / 'css'
    js_path = static_dir / 'js'

    @sync_to_async
    def get_files_with_dates(directory):
        files_info = []
        if directory.exists() and directory.is_dir():
            for f in directory.iterdir():
                if f.is_file():
                    try:
                        # Получение времени создания файла
                        files_info.append({
                            'name': f.name,
                            # 'size_bytes': stat.st_size,
                            # 'modified_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        })
                    except Exception as e2:
                        log.critical(f'Error accessing file {f.name}: {traceback_str(e2)}')
        return files_info

    css_files = await get_files_with_dates(css_path)
    js_files = await get_files_with_dates(js_path)

    # Основные переменные из settings
    config_data = {
        'DEBUG': settings.DEBUG,
        'LANGUAGE_CODE': settings.LANGUAGE_CODE,
        'TIME_ZONE': settings.TIME_ZONE,
        'USE_TZ': settings.USE_TZ,
    }

    # Дополнительная информация о сервере
    try:
        disk_usage_info = shutil.disk_usage('/')
        disk_usage = {
            'total_disk_gb': round(disk_usage_info.total / (1024 ** 3), 2),
            'used_disk_gb': round(disk_usage_info.used / (1024 ** 3), 2),
            'free_disk_gb': round(disk_usage_info.free / (1024 ** 3), 2),
        }
    except Exception as e:
        disk_usage = f'Error fetching disk usage: {e}'

    server_info = {
        'current_time': datetime.now(timezone.utc).isoformat() + 'Z',
        'python_version': sys.version,
        'django': django.get_version(),
        'css': css_files[0]['name'],
        'js': js_files[0]['name'],
        'cpu_count': os.cpu_count(),
        'platform': platform.platform(),
        'disk_usage': disk_usage,
    }

    # Объединяем все данные
    response_data = {
        'config': config_data,
        'server_info': server_info,
    }

    return JsonResponse(response_data, safe=False, json_dumps_params={'ensure_ascii': False})


@staff_required
async def clear_redis(_, key=None):
    """
    - Если передан GET-параметр 'key', удаляет только указанный ключ.
    - Если параметр 'key' не передан, очищает весь Redis-кеш.
    """
    try:
        redis_conn = get_redis_connection('default')  # Используйте нужное имя соединения, если оно отличается

        if key:
            # Удаляем только указанный ключ
            deleted = await sync_to_async(redis_conn.delete)(key)
            if deleted:
                log.info(f'Ключ "{key}" успешно удалён.')
                return JsonResponse(
                    {'status': f'Ключ "{key}" успешно удалён.'},
                    status=HTTP_200_OK
                )
            else:
                log.info(f'Ключ "{key}" не найден.')
                return JsonResponse(
                    {'status': f'Ключ "{key}" не найден.'},
                    status=HTTP_200_OK
                )
        else:
            # Очищаем весь Redis-кеш
            await sync_to_async(redis_conn.flushdb)()
            log.info('Весь Redis-кеш успешно очищен.')
            return JsonResponse(
                {'status': 'Весь Redis-кеш успешно очищен.'},
                status=HTTP_200_OK
            )
    except Exception as e:
        log.exception(f'Ошибка при очистке Redis-кеша: {traceback_str(e)}')
        return JsonResponse(
            {'error': f'Не удалось очистить Redis-кеш: {traceback_str(e)}'},
            status=HTTP_500_INTERNAL_SERVER_ERROR
        )


def change_user_id(request, new_id):
    if not request.user or not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Access denied'}, status=HTTP_403_FORBIDDEN)
    request.user.service.change_id(new_id)
    return JsonResponse({'status': 'id changed'}, status=HTTP_200_OK)


@staff_required
async def run_collectstatic(_):
    """
    Асинхронный контроллер для выполнения команды collectstatic.
    Доступен только для пользователей с разрешениями IsAuthenticated и AdminPermission.
    """
    loop = asyncio.get_event_loop()
    try:
        # Выполнение collectstatic в отдельном потоке, чтобы не блокировать основной поток
        await loop.run_in_executor(
            None,  # Использует дефолтный ThreadPoolExecutor
            call_command,
            'collectstatic',
            '--noinput'  # Автоматически подтверждает выполнение без интерактивных запросов
        )
        return JsonResponse(
            {'status': 'collectstatic successfully'},
            status=HTTP_200_OK
        )
    except Exception as e:
        return JsonResponse(
            {'error': f'Failed collectstatic: {traceback_str(e)}'},
            status=HTTP_500_INTERNAL_SERVER_ERROR
        )


@staff_required
async def run_init_test_db(request):
    if request.user.id != 1:
        return JsonResponse({'error': 'Access denied'}, status=HTTP_403_FORBIDDEN)
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
    loop = asyncio.get_event_loop()
    try:
        # Run the 'init_test_db' command with '--prod' and 'interactive=False' to skip prompts
        await loop.run_in_executor(
            None,  # Uses the default ThreadPoolExecutor
            call_command,
            'init_test_db',
            'start',
            'Yes',
        )
        return JsonResponse(
            {'status': 'init_test_db successfully'},
            status=200
        )
    except Exception as e:
        return JsonResponse(
            {'error': f'Failed to initialize test DB: {traceback_str(e)}'},
            status=500
        )


@staff_required
async def invalidate_cachalot_cache(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(
            None,  # Uses the default ThreadPoolExecutor
            call_command,
            'invalidate_cachalot',
        )
        return JsonResponse(
            {'status': 'Cache invalidated successfully'},
            status=200
        )
    except Exception as e:
        return JsonResponse(
            {'error': f'Failed to invalidate cache: {traceback_str(e)}'},
            status=500
        )
