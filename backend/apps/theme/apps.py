# theme/apps.py
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ThemeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.theme'
    verbose_name = _('Theme')
