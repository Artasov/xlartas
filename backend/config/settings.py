import logging
import os
from datetime import timedelta
from pathlib import Path
from pathlib import Path

from dotenv import load_dotenv
from transliterate.utils import _

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
BASE_DATA_DIR = BASE_DIR / 'data'

# Environment helper
env = os.environ.get

dotenv_path = os.path.join(BASE_DIR, '../.env.production')
load_dotenv(dotenv_path=dotenv_path)

# Basic settings
DEV = bool(int(env('DEV', 0)))
DEBUG = bool(int(env('DEBUG', 0)))
SECRET_KEY = env('SECRET_KEY')
ALLOWED_HOSTS = ['localhost', env('MAIN_DOMAIN', '127.0.0.1')] + env('ALLOWED_HOSTS', '').split(',')
ROOT_URLCONF = 'apps.Core.urls'

# Security and domain settings
HTTPS = bool(int(env('HTTPS', 0)))
MAIN_DOMAIN = env('MAIN_DOMAIN', '127.0.0.1')
DOMAIN_URL = f'http{"s" if HTTPS else ""}://{MAIN_DOMAIN}{"" if HTTPS else ":8000"}'

# Database and cache
REDIS_BASE_URL = 'redis://127.0.0.1:6379/'
REDIS_URL = env('REDIS_URL', REDIS_BASE_URL + '0')
REDIS_CACHE_URL = env('REDIS_CACHE_URL', REDIS_BASE_URL + '1')
DJANGO_REDIS_LOGGER = 'RedisLogger'
DJANGO_REDIS_IGNORE_EXCEPTIONS = True
# SESSION_ENGINE = 'redis_sessions.session'
# SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_CACHE_ALIAS = "default"
SESSION_COOKIE_AGE = 86400  # seconds 2 days
# SESSION_SAVE_EVERY_REQUEST = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [f'http{"s" if not DEV else ""}://{MAIN_DOMAIN}']

# if HTTPS:
#     SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
#     SECURE_SSL_REDIRECT = True

# REFERRER_POLICY = 'origin'
DATA_UPLOAD_MAX_MEMORY_SIZE = 200 * 1024 * 1024
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# REFERRER_POLICY = 'origin'
WSGI_APPLICATION = None  # 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

AUTH_USER_MODEL = 'Core.User'
INSTALLED_APPS = [
    'daphne',
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
    'channels',
    'django_celery_beat',

    'apps.confirmation',
    'apps.Core',
    'apps.shop',
    'apps.tinkoff',
    'apps.referral',
    'apps.surveys',
    'apps.filehost',

]
TINKOFF_TERMINAL_KEY = env('TINKOFF_TERMINAL_KEY')
TINKOFF_PASSWORD_KEY = "Password"
TINKOFF_PASSWORD = env('TINKOFF_PASSWORD')

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
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

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://localhost:3000',
]
# REFERRER_POLICY = 'origin'
MIDDLEWARE = [
    # 'django_referrer_policy.middleware.ReferrerPolicyMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

SITE_ID = int(env('SITE_ID'))

GOOGLE_CLIENT_ID = env('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = env('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = f'{DOMAIN_URL}/google-callback/'

DISCORD_CLIENT_ID = env('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = env('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = f'{DOMAIN_URL}/discord-callback/'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    # 'allauth.account.auth_backends.AuthenticationBackend',
]
# ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 1
# ACCOUNT_EMAIL_REQUIRED = True
# ACCOUNT_EMAIL_UNIQUE = True
# ACCOUNT_EMAIL_VERIFICATION = "none"
# ACCOUNT_RATE_LIMITS = {
#     'login_failed': '5/m'
# }
# ACCOUNT_LOGOUT_REDIRECT_URL = '/accounts/login/'
# LOGIN_REDIRECT_URL = 'main'  # default to /accounts/profile
# ACCOUNT_USERNAME_REQUIRED = True
# SOCIALACCOUNT_AUTO_SIGNUP = True
# SOCIALACCOUNT_LOGIN_ON_GET = True
# ACCOUNT_PASSWORD_INPUT_RENDER_VALUE = True
# ACCOUNT_AUTHENTICATION_METHOD = 'username'
# ACCOUNT_FORMS = {
#     'login': 'allauth.ACCOUNT.forms.SignInForm',
#     'signup': 'allauth.ACCOUNT.forms.SignupForm',
#     'add_email': 'allauth.ACCOUNT.forms.AddEmailForm',
#     'change_password': 'allauth.ACCOUNT.forms.ChangePasswordForm',
#     'set_password': 'allauth.ACCOUNT.forms.SetPasswordForm',
#     'reset_password': 'allauth.ACCOUNT.forms.ResetPasswordForm',
#     'reset_password_from_key': 'allauth.ACCOUNT.forms.ResetPasswordKeyForm',
#     'disconnect': 'allauth.socialaccount.forms.DisconnectForm',
# }

# Static and media files
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]
STATICFILES_DIRS = [
    os.path.join(BASE_DIR.parent, 'frontend/build/static'),
]
MINIO_EXTERNAL_ENDPOINT_USE_HTTPS = None
MINIO_USE_HTTPS = None

if DEV:
    STATIC_ROOT = BASE_DIR.parent / 'static'
    MEDIA_ROOT = BASE_DIR.parent / 'media'
    STATIC_URL = '/static/'
    MEDIA_URL = '/media/'
else:
    STATIC_ROOT = None
    MEDIA_ROOT = None
    STATIC_URL = f'{DOMAIN_URL}/static/'
    MEDIA_URL = f'{DOMAIN_URL}/media/'

    MINIO_ENDPOINT = 'minio:9000'
    MINIO_EXTERNAL_ENDPOINT = f'{MAIN_DOMAIN}'  # For external access use Docker hostname and MinIO port
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

# Celery
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

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

if DEV:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': env('SQL_ENGINE'),
            'NAME': env('SQL_DATABASE_NAME'),
            'USER': env('SQL_USER'),
            'PASSWORD': env('SQL_PASSWORD'),
            'HOST': env('SQL_HOST'),
            'PORT': env('SQL_PORT'),
        }
    }

CACHES = {
    'default': {
        "BACKEND": "django_redis.cache.RedisCache",
        'LOCATION': REDIS_CACHE_URL,
        'OPTIONS': {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            # "hosts": [('redis', 6379)],
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
# Logging
LOG_PREFIX = env('LOG_PREFIX', 'server')
logs_prod_dir = os.path.join(BASE_DIR.parent, 'logs/django_prod', LOG_PREFIX)
logs_dev_dir = os.path.join(BASE_DIR.parent, 'logs/django_dev', LOG_PREFIX)
logs_sql_prod_dir = os.path.join(logs_prod_dir, 'sql')
logs_sql_dev_dir = os.path.join(logs_dev_dir, 'sql')

for path in [logs_prod_dir, logs_dev_dir, logs_sql_prod_dir, logs_sql_dev_dir]:
    os.makedirs(path, exist_ok=True)

if not DEV:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'base_formatter': {
                'format': '{levelname} {asctime} {module}: {message}',
                'style': '{',
            }
        },
        'handlers': {
            'file_sql': {
                'level': 'DEBUG' if DEBUG and DEV else 'WARNING',
                'class': 'logging.handlers.TimedRotatingFileHandler',
                'filename': os.path.join(logs_sql_dev_dir if DEBUG and DEV else logs_sql_prod_dir, 'sql.log'),
                'when': 'midnight',
                'backupCount': 30,  # How many days to keep logs
                'formatter': 'base_formatter',
                'encoding': 'utf-8',
            },
            'file': {
                'level': 'DEBUG' if DEBUG and DEV else 'WARNING',
                'class': 'logging.handlers.TimedRotatingFileHandler',
                'filename': os.path.join(logs_dev_dir if DEBUG and DEV else logs_prod_dir, 'django.log'),
                'when': 'midnight',
                'backupCount': 30,  # How many days to keep logs
                'formatter': 'base_formatter',
                'encoding': 'utf-8',
            },
            'console': {
                'level': 'DEBUG' if DEBUG and DEV else 'WARNING',
                'class': 'logging.StreamHandler',
                'formatter': 'base_formatter',
            },
        },
        'loggers': {
            'base': {
                'handlers': ['console', 'file'],
                'level': 'DEBUG' if DEBUG and DEV else 'WARNING',
                'propagate': True,
            },
            # 'django.db.backends': {  # All SQL
            #     'level': 'DEBUG' if DEBUG and DEV else 'WARNING',
            #     'handlers': ['file_sql'],
            #     'propagate': False,
            # },
        },
    }
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
            os.path.join(BASE_DIR.parent, 'frontend/build')
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
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# if DEV:
#     import mimetypes
#
#     mimetypes.add_type("application/javascript", ".js", True)
#     INTERNAL_IPS = ('127.0.0.1',)
#     MIDDLEWARE += (
#         'debug_toolbar.middleware.DebugToolbarMiddleware',
#     )
#     INSTALLED_APPS += (
#         'debug_toolbar',
#     )
#     DEBUG_TOOLBAR_PANELS = [
#         'debug_toolbar.panels.versions.VersionsPanel',
#         'debug_toolbar.panels.timer.TimerPanel',
#         'debug_toolbar.panels.settings.SettingsPanel',
#         'debug_toolbar.panels.headers.HeadersPanel',
#         'debug_toolbar.panels.request.RequestPanel',
#         'debug_toolbar.panels.sql.SQLPanel',
#         'debug_toolbar.panels.staticfiles.StaticFilesPanel',
#         'debug_toolbar.panels.templates.TemplatesPanel',
#         'debug_toolbar.panels.cache.CachePanel',
#         'debug_toolbar.panels.signals.SignalsPanel',
#         'debug_toolbar.panels.logging.LoggingPanel',
#         'debug_toolbar.panels.redirects.RedirectsPanel',
#     ]
#
#     DEBUG_TOOLBAR_CONFIG = {
#         'INTERCEPT_REDIRECTS': False,
#     }

LANGUAGES = [
    ('en', _('English')),
    # ('ru', _('Russian')),
    # Добавьте другие языки по необходимости
]
LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

log = logging.getLogger('base')

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
