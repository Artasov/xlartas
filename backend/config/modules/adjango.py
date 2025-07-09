from adjango.utils.common import is_celery

from config.base import BASE_DIR
from utils.handle_exceptions import handling_function

# adjango
ADJANGO_BACKENDS_APPS = BASE_DIR / 'apps'
ADJANGO_FRONTEND_APPS = BASE_DIR.parent / 'frontend' / 'src'
ADJANGO_APPS_PREPATH = 'apps.'
ADJANGO_UNCAUGHT_EXCEPTION_HANDLING_FUNCTION = handling_function
ADJANGO_CONTROLLERS_LOGGER_NAME = 'global'
ADJANGO_CONTROLLERS_LOGGING = False
ADJANGO_EMAIL_LOGGER_NAME = 'email'
# ADJANGO_IP_LOGGER = 'global'
ADJANGO_IP_META_NAME = 'HTTP_X_FORWARDED_FOR'
COPY_PROJECT_CONFIGURATIONS = BASE_DIR / 'utils' / 'copy_configuration.py'
IS_CELERY = is_celery()
