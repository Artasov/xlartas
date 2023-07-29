import os
from pathlib import Path

import environ

env = environ.Env()

BASE_DIR = Path(__file__).resolve().parent.parent

environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = bool(int(env('DEBUG')))
DEV = bool(int(env('DEV')))
ALLOWED_HOSTS = str(env('ALLOWED_HOSTS')).split(',')

AUTH_USER_MODEL = 'Core.User'
LOCAL_APPS = [
    'freekassa',
    'Core',
    'APP_referral',
    'APP_shop',
    'APP_api',
    'APP_private_msg',
    'APP_filehost',
    'APP_resource_pack',
    'APP_tests',
]
THIRD_APPS = [
    'rest_framework',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.telegram',
    'allauth.socialaccount.providers.github',
]
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'django.contrib.sites'
]

INSTALLED_APPS = LOCAL_APPS + THIRD_APPS + DJANGO_APPS

MIDDLEWARE = [
    'django_referrer_policy.middleware.ReferrerPolicyMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'base_formatter': {
            'format': '{levelname} {asctime} {module}: {message}',
            'style': '{',
            'encoding': 'utf-8',
        }
    },
    'handlers': {
        'file': {
            'level': 'DEBUG' if DEBUG else 'WARNING',  # Уровень логирования. Выберите нужный уровень.
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django.log',  # Имя файла, куда будут записываться логи.
            'formatter': 'base_formatter',
            'encoding': 'utf-8',
        },
    },
    'loggers': {
        'Core': {
            'handlers': ['file'],
            'level': 'DEBUG' if DEBUG else 'WARNING',
            'propagate': True,
        },
        'APP_shop': {
            'handlers': ['file'],
            'level': 'DEBUG' if DEBUG else 'WARNING',
            'propagate': True,
        },
        'APP_api': {
            'handlers': ['file'],
            'level': 'DEBUG' if DEBUG else 'WARNING',
            'propagate': True,
        },
    },
}

if DEV:
    import mimetypes

    mimetypes.add_type("application/javascript", ".js", True)
    INTERNAL_IPS = ('127.0.0.1',)
    MIDDLEWARE += (
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    )
    INSTALLED_APPS += (
        'debug_toolbar',
    )
    DEBUG_TOOLBAR_PANELS = [
        'debug_toolbar.panels.versions.VersionsPanel',
        'debug_toolbar.panels.timer.TimerPanel',
        'debug_toolbar.panels.settings.SettingsPanel',
        'debug_toolbar.panels.headers.HeadersPanel',
        'debug_toolbar.panels.request.RequestPanel',
        'debug_toolbar.panels.sql.SQLPanel',
        'debug_toolbar.panels.staticfiles.StaticFilesPanel',
        'debug_toolbar.panels.templates.TemplatesPanel',
        'debug_toolbar.panels.cache.CachePanel',
        'debug_toolbar.panels.signals.SignalsPanel',
        'debug_toolbar.panels.logging.LoggingPanel',
        'debug_toolbar.panels.redirects.RedirectsPanel',
    ]

    DEBUG_TOOLBAR_CONFIG = {
        'INTERCEPT_REDIRECTS': False,
    }

SITE_ID = int(env('SITE_ID'))

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'telegram': {
        'TOKEN': env('TG_TOKEN')
    }
}
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 1
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_UNIQUE = True
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_LOGIN_ATTEMPTS_LIMIT = 5
ACCOUNT_LOGIN_ATTEMPTS_TIMEOUT = 86400  # 1 day in seconds
ACCOUNT_LOGOUT_REDIRECT_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = 'main'  # default to /accounts/profile
ACCOUNT_USERNAME_REQUIRED = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_LOGIN_ON_GET = True
ACCOUNT_PASSWORD_INPUT_RENDER_VALUE = True
ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_FORMS = {
    'login': 'allauth.account.forms.LoginForm',
    'signup': 'allauth.account.forms.SignupForm',
    'add_email': 'allauth.account.forms.AddEmailForm',
    'change_password': 'allauth.account.forms.ChangePasswordForm',
    'set_password': 'allauth.account.forms.SetPasswordForm',
    'reset_password': 'allauth.account.forms.ResetPasswordForm',
    'reset_password_from_key': 'allauth.account.forms.ResetPasswordKeyForm',
    'disconnect': 'allauth.socialaccount.forms.DisconnectForm',
}

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly'
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '60/minute'
    }
}

REFERRER_POLICY = 'origin'
WSGI_APPLICATION = 'config.wsgi.application'
ROOT_URLCONF = 'Core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'Core' / 'templates'
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

if DEV:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': env('DATABASES_USER'),
            'USER': env('DATABASES_USER'),
            'PASSWORD': env('DATABASES_PASS'),
            'PORT': env('DATABASES_PORT'),
            'HOST': env('DATABASES_HOST'),

            "OPTIONS": {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES', innodb_strict_mode=1",
                # 'init_command': "SET GLOBAL max_connections = 100000",
            },
        }
    }
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

LANGUAGE_CODE = 'ru-RU'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR.parent / 'static'
STATICFILES_DIRS = [
    BASE_DIR / 'Core' / 'static',
]
if DEBUG:
    MEDIA_URL = '/media/'
else:
    MEDIA_URL = '/static/media/'
MEDIA_ROOT = BASE_DIR.parent / 'static' / 'media'

GOOGLE_RECAPTCHA_SECRET_KEY = env('GOOGLE_RECAPTCHA_SECRET_KEY')
GOOGLE_RECAPTCHA_SITE_KEY = env('GOOGLE_RECAPTCHA_SITE_KEY')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.timeweb.ru'
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
EMAIL_PORT = 25
EMAIL_USE_SSL = False
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = env('EMAIL_HOST_USER')
SERVER_EMAIL = env('EMAIL_HOST_USER')

PAGINATION_RP_COUNT = 12

MAX_UPLOAD_SIZE_ANON_MB = 30
MAX_UPLOAD_SIZE_AUTHED_MB = 100

CONFIRMATION_CODE_LIFE_TIME = 1  # minutes

DEVELOPER_EMAIL = 'ivanhvalevskey@gmail.com'

FK_MERCHANT_ID = env('FK_MERCHANT_ID')
FK_SECRET_WORD1 = env('FK_SECRET_WORD1')
FK_SECRET_WORD2 = env('FK_SECRET_WORD2')
FK_API_URL = 'https://api.freekassa.ru/v1/'
FK_API_KEY = env('FK_API_KEY')
FK_SHOP_ID = '666'
