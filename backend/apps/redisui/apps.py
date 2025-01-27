# redisui/apps.py
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class RedisUiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.redisui'
    verbose_name = _('RedisUi')
