# commerce/apps.py
from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class CommerceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.commerce'
    verbose_name = _('Commerce')

    def ready(self):
        from apps.commerce.services.payment_registry import _bootstrap_registry  # noqa
        _bootstrap_registry()
