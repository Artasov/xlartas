from adjango.utils.common import is_celery
from django.utils.translation import gettext_lazy as _

from config.base import *
from config.modules.adjango import *
from config.modules.cache import *
from config.modules.celery_settings import *
from config.modules.email import *
from config.modules.jazzmin import *
from config.modules.locale import *
from config.modules.logging import *
from config.modules.net import *
from config.modules.other import *
from config.modules.project import *
from config.modules.redis import *
from config.modules.storage import *
from config.modules.third_party_services import *
from config.modules.xl_dashboard import *
from utils.handle_exceptions import handling_function


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
    'tinymce',
    'logui',
    'cachalot',
    'csp',

    'apps.seordj',
    'apps.xl_dashboard',
    'apps.company',
    'apps.mailing',
    'apps.confirmation',
    'apps.commerce',
    'apps.redisui',
    'apps.social_oauth',
    'apps.notify',
    'apps.chat',
    'apps.analytics',
    'apps.core',
    'apps.software',
    'apps.tbank',
    'apps.cloudpayments',
    'apps.freekassa',
    'apps.ckassa',
    'apps.theme',
    'apps.surveys',
    'apps.filehost',
    'apps.xlmine',

]
if MINIO_USE: INSTALLED_APPS.append('django_minio_backend')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'adjango.middleware.IPAddressMiddleware',
    'logui.middleware.RequestResponseLoggerMiddleware',
    'silk.middleware.SilkyMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # 'csp.middleware.CSPMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'apps.core.middleware.UserPreferredLocale',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.analytics.middleware.VisitLoggingMiddleware'

]
if DEV:
    MIDDLEWARE.append('adjango.middleware.MediaDomainSubstitutionJSONMiddleware')

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
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_THROTTLE_CLASSES': [] if DEV else [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '600/minute',
        'user': '600/minute',
    }
}
REST_USE_JWT = True
