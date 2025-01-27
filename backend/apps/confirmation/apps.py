# confirmation/apps.py
from django.apps import AppConfig

from django.utils.translation import gettext_lazy as _


class ConfirmationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.confirmation'
    verbose_name = _('Confirmation')
