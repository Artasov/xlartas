# Logging
from os import makedirs
from os.path import join, exists

from config.base import BASE_DIR

LOGS_DIR = join(BASE_DIR, 'logs')
LOGUI_URL_PREFIX = 'logui/'
if not exists(LOGS_DIR):
    makedirs(LOGS_DIR)
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
        'ckassa': {
            'handlers': ['daily_file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'commerce': {
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
