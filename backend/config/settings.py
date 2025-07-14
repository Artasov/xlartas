import logging

from adjango.utils.common import is_celery
from django.utils.translation import gettext_lazy as _

from apps.converter.utils.format import get_supported_image_formats, get_supported_audio_formats
from config.base import *
from config.modules.adjango import *
from config.modules.apps import *
from config.modules.cache import *
from config.modules.celery_settings import *
from config.modules.email import *
from config.modules.jazzmin import *
from config.modules.locale import *
from config.modules.logging import *
from config.modules.middleware import *
from config.modules.net import *
from config.modules.other import *
from config.modules.project import *
from config.modules.redis import *
from config.modules.rest import *
from config.modules.storage import *
from config.modules.third_party_services import *
from config.modules.ws import *
from config.modules.xl_dashboard import *

log = logging.getLogger('global')
log.info('#####################################')
log.info('########## Server Settings ##########')
log.info('#####################################')
log.info(f'{IS_CELERY=}')
log.info(f'{BASE_DIR=}')
log.info(f'{DOMAIN_URL=}')
log.info(f'{HTTPS=}')
log.info(f'{TIME_ZONE=}')
log.info(f'{POSTGRES_USE=}')
log.info(f'{REDIS_HOST=}')
log.info(f'{REDIS_PORT=}')
log.info(f'{MINIO_USE=}')
log.info(f'{CSRF_TRUSTED_ORIGINS=}')
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
log.info(f'{DATA_UPLOAD_MAX_MEMORY_SIZE=}')
log.info(f'{FILE_UPLOAD_MAX_MEMORY_SIZE=}')
log.info(f'{FILE_UPLOAD_HANDLERS=}')
log.info(f'{FILE_UPLOAD_TEMP_DIR=}')
log.info('#####################################')
log.info('#####################################' )
log.info('#####################################')
