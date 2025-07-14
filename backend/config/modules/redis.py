# Redis
from config.base import env

REDIS_HOST = env('REDIS_HOST')
REDIS_PORT = int(env('REDIS_PORT'))
REDIS_BROKER_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/0'
REDIS_CACHE_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/1'
REDISUI_URL_PREFIX = 'redis/'
REDISUI_CONTROLLERS_SETTINGS = {
    'auth_required': True,
    'log_name': False,
    'not_auth_redirect': f'/admin/login/?next=/{REDISUI_URL_PREFIX}'}
