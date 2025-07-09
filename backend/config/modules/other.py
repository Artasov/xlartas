from csp.constants import SELF, UNSAFE_INLINE, UNSAFE_EVAL, UNSAFE_HASHES  # noqa

from config.base import DOMAIN_URL
from config.modules.logging import LOGUI_URL_PREFIX
from config.modules.redis import REDISUI_URL_PREFIX

CONTENT_SECURITY_POLICY = {
    'DIRECTIVES': {
        'default-src': [SELF],

        'script-src': [
            SELF,
            'https://widget.cloudpayments.ru',
            'https://forma.tinkoff.ru',
            'https://pay.google.com',
            'https://pay.yandex.ru',
            UNSAFE_INLINE,
            UNSAFE_EVAL,
            UNSAFE_HASHES,
        ],
        'style-src': [
            SELF,
            'https://fonts.googleapis.com',
            UNSAFE_INLINE,
        ],
        'font-src': [
            SELF,
            'https://fonts.gstatic.com',
        ],
        'img-src': [
            SELF,
            'data:',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://xlartas.ru',
        ],
        'frame-src': [
            SELF,
            'https://widget.cloudpayments.ru',
            'https://pay.google.com',
            'https://pay.yandex.ru',
            'https://forma.tinkoff.ru',
        ],

        # optional, for older browsers that don’t support frame-src
        'child-src': [
            SELF,
            'https://widget.cloudpayments.ru',
            'https://pay.google.com',
            'https://pay.yandex.ru',
            'https://forma.tinkoff.ru',
        ],
    },
}

# dj-endpoints
EP_NOT_AUTH_REDIRECT_URL = '/admin/login/?next=/endpoints/'
EP_EXCLUDED_APPS = tuple(['logui', 'swagger', 'rest_framework'])
EP_CUSTOM_LINKS = [
    {'name': 'Site', 'url': f'{DOMAIN_URL}'},
    {'name': 'Logs', 'url': f'{DOMAIN_URL}/{LOGUI_URL_PREFIX}'},
    {'name': 'Silk', 'url': f'{DOMAIN_URL}/silk/'},
    {'name': 'Redis', 'url': f'{DOMAIN_URL}/{REDISUI_URL_PREFIX}'},
    {'name': 'Swagger', 'url': f'{DOMAIN_URL}/swagger/'},
    {'name': 'Nginx', 'url': 'http://xlartas.ru:81/'},
    {'name': 'Minio', 'url': 'https://minio.xlartas.ru/'},
    {'name': 'Pg Admin', 'url': 'https://pgadmin.xlartas.ru/'},
    {'name': 'Flower', 'url': 'https://flower.xlartas.ru/flower/'},
]

# Silk
SILKY_PYTHON_PROFILER = False
SILKY_AUTHENTICATION = True
SILKY_AUTHORISATION = True
SILKY_META = True
