from datetime import timedelta
from os import makedirs
from os.path import join

from config.base import BASE_DIR, FRONTEND_DIR, MAIN_DOMAIN, env

MINIO_USE = bool(int(env('MINIO_USE')))

# Internationalization defaults
# Actual values are defined near the bottom with env overrides.
# Ограничение размера данных POST до 3 ГБ (в байтах)
DATA_UPLOAD_MAX_MEMORY_SIZE = 3 * 1024 * 1024 * 1024  # 3 ГБ
# Порог для хранения файла в памяти (при превышении файла он будет сохраняться во временную директорию)
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5 МБ
# Используем обработчик, который сохраняет загружаемые файлы во временные файлы, а не в память
FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]
FILE_UPLOAD_TEMP_DIR = join(BASE_DIR.parent, 'data', 'temp')
makedirs(FILE_UPLOAD_TEMP_DIR, exist_ok=True)

# Static | Media
STATICFILES_DIRS = (
    join(FRONTEND_DIR, 'build', 'static'),
    join(BASE_DIR, 'static')
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)
MINIO_EXTERNAL_ENDPOINT_USE_HTTPS = True
MINIO_USE_HTTPS = False
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
STATIC_ROOT = BASE_DIR.parent / 'static'
MEDIA_ROOT = BASE_DIR.parent / 'media'
if MINIO_USE:
    MINIO_ENDPOINT = 'minio:9000'
    MINIO_EXTERNAL_ENDPOINT = MAIN_DOMAIN
    MINIO_ACCESS_KEY = env('MINIO_ROOT_USER')
    MINIO_SECRET_KEY = env('MINIO_ROOT_PASSWORD')
    MINIO_EXTERNAL_ENDPOINT_USE_HTTPS = bool(int(env('MINIO_EXTERNAL_ENDPOINT_USE_HTTPS') or 0))
    MINIO_USE_HTTPS = bool(int(env('MINIO_USE_HTTPS') or 0))
    MINIO_URL_EXPIRY_HOURS = timedelta(days=1)
    MINIO_CONSISTENCY_CHECK_ON_START = True
    MINIO_PRIVATE_BUCKETS = [
        'django-backend-dev-private',
    ]
    MINIO_PUBLIC_BUCKETS = [
        'static',
        'media',
    ]
    MINIO_POLICY_HOOKS: list[tuple[str, dict]] = []
    MINIO_STATIC_FILES_BUCKET = 'static'  # Just bucket name may be 'my-static-files'?
    MINIO_MEDIA_FILES_BUCKET = 'media'  # Just bucket name may be 'media-files'?
    MINIO_BUCKET_CHECK_ON_SAVE = True  # Default: True // Creates a cart if it doesn't exist, then saves it
    MINIO_PUBLIC_BUCKETS.append(MINIO_STATIC_FILES_BUCKET)
    MINIO_PUBLIC_BUCKETS.append(MINIO_MEDIA_FILES_BUCKET)
    MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
    MINIO_STORAGE_AUTO_CREATE_STATIC_BUCKET = True
    DEFAULT_FILE_STORAGE = 'django_minio_backend.models.MinioBackend'
    STATICFILES_STORAGE = 'django_minio_backend.models.MinioBackendStatic'
    FILE_UPLOAD_MAX_MEMORY_SIZE = 65536
