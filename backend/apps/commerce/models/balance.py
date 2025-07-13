from django.db.models import CASCADE, ForeignKey, DecimalField
from django.utils.translation import gettext_lazy as _

from apps.commerce.models.order import Order
from apps.commerce.models.product import Product
from apps.commerce.services.balance import BalanceProductService, BalanceProductOrderService


class BalanceProduct(Product):
    class Meta:
        verbose_name = _('Balance product')
        verbose_name_plural = _('Balance products')

    def __str__(self):
        return 'Balance top up'

    @property
    def service(self) -> BalanceProductService:
        return BalanceProductService(self)


class BalanceProductOrder(Order):
    product = ForeignKey(BalanceProduct, CASCADE, 'balance_orders', verbose_name=_('Product'))
    requested_amount = DecimalField(_('Requested amount'), max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = _('Balance product order')
        verbose_name_plural = _('Balance product orders')

    @property
    def service(self) -> BalanceProductOrderService:
        return BalanceProductOrderService(self)
