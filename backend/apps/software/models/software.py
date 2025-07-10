# software/models/software.py
import logging
from typing import TYPE_CHECKING

from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin, ACreatedAtIndexedMixin
from django.db.models import (
    ForeignKey, CASCADE, DateTimeField, SET_NULL, CharField, URLField, TextField,
    IntegerField, PositiveIntegerField, OneToOneField, FileField, BooleanField
)
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import Product, Order
from apps.core.models import User
from apps.software.exceptions.license import SoftwareLicenseException
from apps.software.exceptions.software import SoftwareException
from apps.software.services.license import SoftwareLicenseService
from apps.software.services.order import SoftwareOrderService
from apps.software.services.software import SoftwareService

if TYPE_CHECKING:
    from django.db.models.manager import RelatedManager
    from apps.commerce.models.product import ProductPrice

log = logging.getLogger('global')


class SoftwareFile(ACreatedAtIndexedMixin):
    file = FileField(upload_to='software/files/', verbose_name=_('File'))
    version = CharField(max_length=20, blank=True, null=True)

    class Meta:
        verbose_name = _('Software file')
        verbose_name_plural = _('Software files')

    def __str__(self):
        return f'SoftwareFile: (v{self.version})'


class Software(Product, SoftwareService, SoftwareException):
    prices: RelatedManager['ProductPrice']
    file = OneToOneField(
        'software.SoftwareFile', SET_NULL,
        null=True, blank=True, verbose_name=_('File')
    )
    review_url = URLField(_('Review URL'), max_length=500, blank=True, null=True)
    guide_url = URLField(_('Guide URL'), max_length=500, blank=True, null=True)
    log_changes = TextField(blank=True, null=True)
    test_period_days = IntegerField(default=3)
    min_license_order_hours = PositiveIntegerField(default=1, help_text='Minimum number of hours to order')

    class Meta:
        verbose_name = _('Software')
        verbose_name_plural = _('Softwares')

    def __str__(self):
        return f'{self.name} (v{self.file.version})' if self.file else self.name


class SoftwareOrder(Order, SoftwareOrderService):
    product = ForeignKey(Software, CASCADE, 'orders', verbose_name=_('Software Product'))
    license_hours = PositiveIntegerField(
        _('License Hours'), default=1,
        help_text='How many hours of the license are bought by the user'
    )

    class Meta:
        verbose_name = _('Software Order')
        verbose_name_plural = _('Software Orders')


class SoftwareLicense(ACreatedUpdatedAtIndexedMixin, SoftwareLicenseService, SoftwareLicenseException):
    user = ForeignKey(User, CASCADE, 'software_licenses', verbose_name=_('User'))
    software = ForeignKey(Software, CASCADE, 'licenses', verbose_name=_('Software'))
    license_ends_at = DateTimeField(_('License ends at'), blank=True, null=True)
    is_tested = BooleanField(_('Is tested'), default=False)

    class Meta:
        verbose_name = _('Software License')
        verbose_name_plural = _('Software Licenses')
        unique_together = ('user', 'software')

    def __str__(self):
        return f'{self.user} -> {self.software} (until {self.license_ends_at})'

    def is_active(self) -> bool:
        if not self.license_ends_at:
            return False
        return self.license_ends_at > timezone.now()
