from config.base import env
from config.modules.redis import REDIS_CACHE_URL

# Cache
CACHALOT_ENABLED = bool(int(env('CACHALOT_ENABLED')))
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_CACHE_URL,
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient', }
    }
}
