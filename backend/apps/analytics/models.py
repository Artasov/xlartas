# analytics/models.py
from adjango.models.mixins import ACreatedAtMixin
from django.db.models import GenericIPAddressField, ForeignKey, CASCADE

from django.utils.translation import gettext_lazy as _


class Visit(ACreatedAtMixin):
    ip_address = GenericIPAddressField(verbose_name=_('IP address'))
    user = ForeignKey('core.User', CASCADE, 'visits', null=True, blank=True, verbose_name=_('User'))

    def __str__(self):
        return f'Visit from {self.ip_address} at {self.created_at}'
