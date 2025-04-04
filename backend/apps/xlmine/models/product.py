# xlmine/models/product.py
from adjango.exceptions.base import ModelApiBaseException
from django.db.models import CASCADE, ForeignKey
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import Product, Order
from apps.xlmine.services.donate import DonateService, DonateOrderService


class Donate(Product, DonateService, ModelApiBaseException):
    """
    Продукт «Донат». При покупке данного продукта пользователю начисляются
    внутриигровые коины (coins_amount).
    """

    class Meta:
        verbose_name = 'Donate'
        verbose_name_plural = 'Donates'

    def __str__(self): return 'Donate'


class DonateOrder(Order, DonateOrderService):
    """
    Заказ на покупку Donate (донат).
    """
    product = ForeignKey(Donate, CASCADE, 'donate_orders', verbose_name=_('Donate product'))

    class Meta:
        verbose_name = _('Donate order')
        verbose_name_plural = _('Donate orders')

    def __str__(self):
        return f"DonateOrder:{self.id} [user={self.user_id}]"
