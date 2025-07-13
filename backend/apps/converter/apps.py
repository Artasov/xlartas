from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ConverterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.converter'
    verbose_name = _('Converter')
