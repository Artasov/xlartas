# seordj/apps.py
from django.apps import AppConfig

from django.utils.translation import gettext_lazy as _


class SeoRDJConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.seordj'
    verbose_name = _('SeoRDJ')
