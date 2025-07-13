# commerce/models/gift_certificate.py
import uuid

from adjango.models.mixins import ACreatedAtIndexedMixin
from django.db.models import (
    CASCADE, ForeignKey, UUIDField, OneToOneField
)
from django.utils.translation import gettext_lazy as _

from apps.commerce.models.order import Order
from .product import Product
from ..services.gift_certificate import GiftCertificateService, GiftCertificateOrderService


class GiftCertificate(Product):
    product = ForeignKey('commerce.Product', CASCADE, related_name='gift_certificates')

    class Meta:
        verbose_name = _('Gift certificate')
        verbose_name_plural = _('Gift certificates')

    def __str__(self):
        return f'Gift Certificate for Product:{self.product_id}'

    @property
    def service(self) -> GiftCertificateService:
        return GiftCertificateService(self)


class GiftCertificateOrder(Order):
    key = UUIDField(default=uuid.uuid4, editable=False, unique=True)
    product = ForeignKey(GiftCertificate, CASCADE, verbose_name=_('Product'))

    class Meta:
        verbose_name = _('Gift certificate order')
        verbose_name_plural = _('Gift certificate orders')

    @property
    def service(self) -> GiftCertificateOrderService:
        return GiftCertificateOrderService(self)


class GiftCertificateUsage(ACreatedAtIndexedMixin):
    order = OneToOneField(
        GiftCertificateOrder, CASCADE, related_name='gift_certificate_usage', verbose_name=_('Order')
    )
    user = ForeignKey(
        'core.User', CASCADE, 'gift_certificate_usages', verbose_name=_('User')
    )

    class Meta:
        unique_together = ('order', 'user')
        verbose_name = _('Gift certificate usage')
        verbose_name_plural = _('Gift certificate usages')
