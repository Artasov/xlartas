import logging
from datetime import timedelta
from os import environ, makedirs
from os.path import join
from os.path import join, exists
from pathlib import Path
from pathlib import Path

from adjango.utils.common import is_celery, traceback_str
from django.utils.translation import gettext_lazy as _
from dotenv import load_dotenv

from config.jazzmin import JAZZMIN_SETTINGS as _JAZZMIN_SETTINGS
from config.jazzmin import JAZZMIN_UI_TWEAKS
from utils.handle_exceptions import handling_function

# Product
DEBUG_SEND_NOTIFIES = False
MINUTES_CONFIRMATION_CODE_EXPIRES = 2
SECONDS_MAX_FREQUENCY_SENDING_CONFIRMATION_CODE = 60

# Environment helper
env = environ.get
MAIN_PROCESS = True if env('RUN_MAIN') != 'true' else False

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=join(BASE_DIR.parent, '.env'))
APPS_DIR = join(BASE_DIR, 'apps')
FRONTEND_DIR = BASE_DIR.parent / 'frontend'
BASE_DATA_DIR = BASE_DIR / 'data'
SECRET_KEY = env('SECRET_KEY')

# Basic settings
DEV = bool(int(env('DEV', 0)))
DEBUG = bool(int(env('DEBUG', 0)))
INTENSIVE_HEALTH_TEST = bool(int(env('INTENSIVE_HEALTH_TEST')))
ROOT_URLCONF = 'apps.core.routes.root'

# Security and domain settings
HTTPS = bool(int(env('HTTPS')))
SITE_ID = int(env('SITE_ID'))
MAIN_DOMAIN = env('MAIN_DOMAIN', '127.0.0.1')
DOMAIN_URL = f'http{"s" if HTTPS else ""}://{MAIN_DOMAIN}{":8000" if DEV else ""}'
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'web',
    MAIN_DOMAIN,
]
MINIO_USE = bool(int(env('MINIO_USE')))
POSTGRES_USE = bool(int(env('POSTGRES_USE')))

WSGI_APPLICATION = None  # 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_L10N = True
USE_TZ = True

AUTH_USER_MODEL = 'core.User'
INSTALLED_APPS = [
    'daphne',
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',

    'django.contrib.staticfiles',
    'django_extensions',
    'django.contrib.sites',
    'corsheaders',

    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'adrf',
    'adjango',
    'channels',
    'django_celery_beat',
    'phonenumber_field',
    'timezone_field',
    'import_export',
    'django_object_actions',
    'silk',
    'endpoints',
    'logui',
    'cachalot',

    'apps.confirmation',
    'apps.commerce',
    'apps.redisui',
    'apps.social_oauth',
    'apps.notify',
    'apps.chat',
    'apps.core',
    'apps.shop',
    'apps.tinkoff',
    'apps.software',
    'apps.tbank',
    'apps.theme',
    'apps.surveys',
    'apps.filehost',

]
if MINIO_USE: INSTALLED_APPS.append('django_minio_backend')

# Database
if POSTGRES_USE:
    DATABASES = {
        'default': {
            'ENGINE': env('DB_ENGINE'),
            'NAME': env('DB_NAME'),
            'USER': env('DB_USER'),
            'PASSWORD': env('DB_PASSWORD'),
            'HOST': env('DB_HOST'),
            'PORT': env('DB_PORT'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Redis
REDIS_HOST = env('REDIS_HOST')
REDIS_PORT = int(env('REDIS_PORT'))
REDIS_BROKER_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/0'
REDIS_CACHE_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/1'
REDISUI_URL_PREFIX = 'redis/'
REDISUI_CONTROLLERS_SETTINGS = {
    'auth_required': True,
    'log_name': False,
    'not_auth_redirect': f'/admin/login/?next=/{REDISUI_URL_PREFIX}'
}

# adjango
ADJANGO_BACKENDS_APPS = BASE_DIR / 'apps'
ADJANGO_FRONTEND_APPS = BASE_DIR.parent / 'frontend' / 'src' / 'Components'
ADJANGO_APPS_PREPATH = 'apps.'
ADJANGO_UNCAUGHT_EXCEPTION_HANDLING_FUNCTION = handling_function
ADJANGO_CONTROLLERS_LOGGER_NAME = 'global'
ADJANGO_CONTROLLERS_LOGGING = False
ADJANGO_EMAIL_LOGGER_NAME = 'email'
# ADJANGO_IP_LOGGER = 'global'
ADJANGO_IP_META_NAME = 'HTTP_X_FORWARDED_FOR'
IS_CELERY = is_celery()

# Silk
SILKY_PYTHON_PROFILER = False
SILKY_AUTHENTICATION = True
SILKY_AUTHORISATION = True
SILKY_META = True

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'adjango.middleware.IPAddressMiddleware',
    'logui.middleware.RequestResponseLoggerMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {'hosts': [(REDIS_HOST, REDIS_PORT)], },
    },
}

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly'
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        # 'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    # 'DEFAULT_THROTTLE_CLASSES' if not DEV else '': [
    #     'rest_framework.throttling.AnonRateThrottle',
    #     'rest_framework.throttling.UserRateThrottle'
    # ],
    # 'DEFAULT_THROTTLE_RATES': {
    #     'anon': '600/minute',
    #     'user': '600/minute',
    # }
}
REST_USE_JWT = True
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=20 if DEV else 60 * 24 * 2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Cache
CACHALOT_ENABLED = bool(int(env('CACHALOT_ENABLED')))
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_CACHE_URL,
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient', }
    }
}
USER_AGENTS_CACHE = 'default'

CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://localhost:3000',
]

GOOGLE_CLIENT_ID = env('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = env('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = f'{DOMAIN_URL}/google-callback/'
DISCORD_CLIENT_ID = env('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = env('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = f'{DOMAIN_URL}/discord-callback/'
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Logging
LOGS_DIR = join(BASE_DIR, 'logs')
LOGUI_URL_PREFIX = 'logui/'
if not exists(LOGS_DIR): makedirs(LOGS_DIR)
LOGUI_REQUEST_RESPONSE_LOGGER_NAME = 'global'
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '{levelname} {asctime}: {message}',
            'datefmt': '%d-%m %H:%M:%S',
            'style': '{',
        },
        'request': {
            'format': '{levelname} {asctime}: {message} - {method} {url} {status}',
            'style': '{',
        },
    },
    'handlers': {
        'daily_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': join(LOGS_DIR, 'django.log'),
            'when': 'midnight',  # Ротация происходит в полночь
            'interval': 1,  # Интервал ротации — 1 день
            'backupCount': 356,  # Хранить логи за последний год
            'formatter': 'simple',
            'encoding': 'utf8',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'tbank': {
            'handlers': ['daily_file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'global': {
            'handlers': ['daily_file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Static | Media
STATICFILES_DIRS = (
    FRONTEND_DIR / 'build' / 'static',
    BASE_DIR / 'static'
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

# dj-endpoints
EP_NOT_AUTH_REDIRECT_URL = '/admin/login/?next=/endpoints/'
EP_EXCLUDED_APPS = ('logui', 'swagger', 'rest_framework')
EP_CUSTOM_LINKS = [
    {'name': 'Site', 'url': f'{DOMAIN_URL}'},
    {'name': 'Logs', 'url': f'{DOMAIN_URL}/{LOGUI_URL_PREFIX}'},
    {'name': 'Silk', 'url': f'{DOMAIN_URL}/silk/'},
    {'name': 'Redis', 'url': f'{DOMAIN_URL}/{REDISUI_URL_PREFIX}'},
    {'name': 'Swagger', 'url': f'{DOMAIN_URL}/swagger/'},
    {'name': 'Nginx', 'url': 'http://:81/'},
    {'name': 'Minio', 'url': 'https://minio.xlartas.ru/'},
    {'name': 'Pg Admin', 'url': 'https://pgadmin.xlartas.ru/'},
    {'name': 'Flower', 'url': 'https://flower.xlartas.ru/flower/'},
]

# Celery
timezone = TIME_ZONE
CELERY_BROKER_URL = REDIS_BROKER_URL
CELERY_BROKER_TRANSPORT_OPTIONS = {'visibility_timeout': 86400 * 30}
result_backend = REDIS_BROKER_URL
accept_content = ['application/json']
task_serializer = 'json'
result_serializer = 'json'
task_default_queue = 'default'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = True

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = env('TZ', 'Europe/Moscow')
USE_I18N = True
USE_TZ = True

GOOGLE_RECAPTCHA_SECRET_KEY = env('GOOGLE_RECAPTCHA_SECRET_KEY')
GOOGLE_RECAPTCHA_SITE_KEY = env('GOOGLE_RECAPTCHA_SITE_KEY')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.timeweb.ru'
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
EMAIL_PORT = 25
EMAIL_USE_SSL = True
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = env('EMAIL_HOST_USER')
SERVER_EMAIL = env('EMAIL_HOST_USER')
# EMAIL_HOST_USER = env('EMAIL_HOST_USER2') if DEV else env('EMAIL_HOST_USER')
# EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD2') if DEV else env('EMAIL_HOST_PASSWORD')
# EMAIL_PORT = 25
# EMAIL_USE_SSL = True
# EMAIL_USE_TLS = False
# DEFAULT_FROM_EMAIL = env('EMAIL_HOST_USER2') if DEV else env('EMAIL_HOST_USER')
# SERVER_EMAIL = env('EMAIL_HOST_USER2') if DEV else env('EMAIL_HOST_USER')

PAGINATION_RP_COUNT = 12

MAX_UPLOAD_SIZE_ANON_MB = 30
MAX_UPLOAD_SIZE_AUTHED_MB = 100

CONFIRMATION_CODE_LIFE_TIME = 10  # minutes

DEVELOPER_EMAIL = 'ivanhvalevskey@gmail.com'

FK_MERCHANT_ID = env('FK_MERCHANT_ID')
FK_SECRET_WORD1 = env('FK_SECRET_WORD1')
FK_SECRET_WORD2 = env('FK_SECRET_WORD2')
FK_API_URL = 'https://api.freekassa.ru/v1/'
FK_API_KEY = env('FK_API_KEY')
FK_SHOP_ID = '666'

MAX_DEPOSIT_AMOUNT = 10_000
MIN_DEPOSIT_AMOUNT = 1 if DEBUG else 50
DEFAULT_DEPOSIT_AMOUNT = 100

YANDEX_RECAPTCHA_SECRET_KEY = env('YANDEX_RECAPTCHA_SECRET_KEY')

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'apps' / 'Core' / 'templates',
            join(BASE_DIR.parent, 'frontend/build')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Locale
LANGUAGES = (
    ('en', _('English')),
    ('ru', _('Russian')),
)
LOCALE_PATHS = (join(BASE_DIR, 'locale'),)

# TBank
TINKOFF_TERMINAL_KEY = env('TINKOFF_TERMINAL_KEY')
TINKOFF_PASSWORD = env('TINKOFF_PASSWORD')

# Other
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Jazzmin
JAZZMIN_SETTINGS = _JAZZMIN_SETTINGS | {
    'usermenu_links': [
        {'name': 'Site', 'url': f'{DOMAIN_URL}', 'new_window': True},
        {'name': 'Logs', 'url': f'{DOMAIN_URL}/{LOGUI_URL_PREFIX}', 'new_window': True},
        {'name': 'Silk', 'url': f'{DOMAIN_URL}/silk/', 'new_window': True},
        {'name': 'Redis', 'url': f'{DOMAIN_URL}/{REDISUI_URL_PREFIX}', 'new_window': True},
        {'name': 'Swagger', 'url': f'{DOMAIN_URL}/swagger/', 'new_window': True},
        {'name': 'Nginx', 'url': 'http://:81/', 'new_window': True},
        {'name': 'Minio', 'url': 'https://minio.xlartas.ru/', 'new_window': True},
        {'name': 'Pg Admin', 'url': 'https://pgadmin.xlartas.ru/', 'new_window': True},
        {'name': 'Flower', 'url': 'https://flower.xlartas.ru/flower/', 'new_window': True},
    ],
}

log = logging.getLogger('global')

log.info('#####################################')
log.info('########## Server Settings ##########')
log.info('#####################################')
log.info(f'{BASE_DIR=}')
log.info(f'{MAIN_DOMAIN=}')
log.info(f'{HTTPS=}')
log.info(f'{MINIO_EXTERNAL_ENDPOINT_USE_HTTPS=}') if MINIO_EXTERNAL_ENDPOINT_USE_HTTPS else None
log.info(f'{MINIO_USE_HTTPS=}') if MINIO_USE_HTTPS else None
log.info(f'{ALLOWED_HOSTS=}')
log.info(f'{DEBUG=}')
log.info(f'{DEV=}')
log.info(f'{ASGI_APPLICATION=}')
log.info(f'{WSGI_APPLICATION=}')
log.info(f'{STATIC_URL=}')
log.info(f'{MEDIA_URL=}')
log.info(f'{STATIC_ROOT=}')
log.info(f'{MEDIA_ROOT=}')
log.info(f'{GOOGLE_REDIRECT_URI=}')
log.info(f'{DISCORD_REDIRECT_URI=}')
log.info('#####################################')
log.info('#####################################')
log.info('#####################################')
