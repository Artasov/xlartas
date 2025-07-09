from os import environ
from os.path import join

from dotenv import load_dotenv

from config.base import BASE_DIR
from config.modules.redis import REDIS_CACHE_URL

env = environ.get
load_dotenv(dotenv_path=join(BASE_DIR.parent, '.env'))

# Cache
CACHALOT_ENABLED = bool(int(env('CACHALOT_ENABLED')))
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_CACHE_URL,
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient', }
    }
}
