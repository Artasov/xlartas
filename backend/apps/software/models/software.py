import logging

from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db import models
from django.db.models import ForeignKey, CASCADE, DateTimeField, SET_NULL, CharField, URLField, BooleanField
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import Product, Order
from apps.commerce.services.order import IOrderService
from apps.core.models import User
from apps.core.models.file import File
from apps.software.services.license import SoftwareLicenseService
from apps.software.services.software import SoftwareProductService

log = logging.getLogger('global')


class Software(ACreatedUpdatedAtIndexedMixin):
    name = CharField(_('Software Name'), max_length=255, db_index=True)
    file = ForeignKey(File, SET_NULL, 'software_files', null=True, blank=True, verbose_name=_('File'))
    review_url = URLField(_('Review URL'), max_length=500, blank=True, null=True)
    is_active = BooleanField(default=True, db_index=True, verbose_name=_('Is Active'))

    class Meta:
        verbose_name = _('Software')
        verbose_name_plural = _('Softwares')

    def __str__(self):
        return self.name


class SoftwareProduct(Product, SoftwareProductService):
    software = ForeignKey(Software, CASCADE, 'products', verbose_name=_('Related Software'))
    license_hours = models.PositiveIntegerField(
        _('License Hours'), default=1, help_text='Сколько часов лицензии выдать'
    )

    class Meta:
        verbose_name = _('Software Product')
        verbose_name_plural = _('Software Products')

    def __str__(self):
        return f'{self.software.name} [{self.license_hours}h]'


class SoftwareOrder(Order, IOrderService):
    product = ForeignKey(SoftwareProduct, CASCADE, 'orders', verbose_name=_('Software Product'))

    class Meta:
        verbose_name = _('Software Order')
        verbose_name_plural = _('Software Orders')


class SoftwareLicense(ACreatedUpdatedAtIndexedMixin, SoftwareLicenseService):
    user = ForeignKey(User, CASCADE, 'software_licenses', verbose_name=_('User'))
    software = ForeignKey(Software, CASCADE, 'licenses', verbose_name=_('Software'))
    license_ends_at = DateTimeField(_('License ends at'), blank=True, null=True)

    class Meta:
        verbose_name = _('Software License')
        verbose_name_plural = _('Software Licenses')
        unique_together = ('user', 'software')

    def __str__(self):
        return f'{self.user} -> {self.software} (until {self.license_ends_at})'
