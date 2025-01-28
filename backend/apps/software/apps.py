# commerce/apps.py
from django.apps import AppConfig

from django.utils.translation import gettext_lazy as _


class SoftwareConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.software'
    verbose_name = _('Software')
