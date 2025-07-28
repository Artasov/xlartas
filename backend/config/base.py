from os import environ
from os.path import join
from pathlib import Path

from dotenv import load_dotenv

env = environ.get
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=join(BASE_DIR.parent, '.env'))

INTENSIVE_HEALTH_TEST = bool(int(env('INTENSIVE_HEALTH_TEST')))
ROOT_URLCONF = 'apps.core.routes.root'
SITE_ID = int(env('SITE_ID'))

APPS_DIR = join(BASE_DIR, 'apps')
BASE_DATA_DIR = BASE_DIR / 'data'
MAIN_PROCESS = True if env('RUN_MAIN') != 'true' else False

WSGI_APPLICATION = None  # 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DEBUG = bool(int(env('DEBUG', 0)))
SECRET_KEY = env('SECRET_KEY')
DEV = bool(int(env('DEV', 0)))
HTTPS = bool(int(env('HTTPS')))
MAIN_DOMAIN = env('MAIN_DOMAIN', 'localhost')
DOMAIN_URL = f'http{'s' if HTTPS else ''}://{MAIN_DOMAIN}{':8000' if DEV else ''}'

TIME_ZONE = env('TZ', 'Europe/Moscow')

AUTH_USER_MODEL = 'core.User'

# MEDIA_SUBSTITUTION_URL = 'https://xlartas.ru'
MEDIA_SUBSTITUTION_URL = 'http://localhost:8000'

# Database
POSTGRES_USE = bool(int(env('POSTGRES_USE')))
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
            join(BASE_DIR, 'apps', 'core', 'templates'),
            join(BASE_DIR, 'templates'),
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
IMAGEKIT_DEFAULT_CACHEFILE_BACKEND = 'imagekit.cachefiles.backends.Simple'
