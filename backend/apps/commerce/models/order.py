# commerce/models/order.py

from adjango.models import APolymorphicModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import (
    ForeignKey, SET_NULL, CharField, BooleanField, DecimalField
)
from django.utils.translation import gettext_lazy as _

from apps.commerce.managers.order import OrderBaseManager
from apps.commerce.models.payment import PaymentSystem, Currency
from apps.commerce.services.order.base import OrderService
from apps.uuid6.field import UUIDv6Field


class Order(APolymorphicModel, ACreatedUpdatedAtIndexedMixin):
    objects = OrderBaseManager()
    id = UUIDv6Field(primary_key=True, unique=True)
    user = ForeignKey('core.User', SET_NULL, 'orders', null=True, verbose_name=_('User'))
    amount = DecimalField(_('Amount'), max_digits=10, decimal_places=2, null=True, default=None)
    payment = ForeignKey('commerce.Payment', SET_NULL, 'orders', null=True, blank=True, verbose_name=_('Payment'))

    # currency и payment_system system нужны только
    # для того чтобы не запрашивать объект
    # Payment, чтобы узнать валюту и платежную систему
    currency = CharField(verbose_name=_('Currency'), choices=Currency.choices, max_length=3)
    payment_system = CharField(
        verbose_name=_('Payment System'), choices=PaymentSystem.choices,
        max_length=50, db_index=True
    )
    # product = должен быть объявлен в дочерних моделях
    promocode = ForeignKey(
        'commerce.Promocode', on_delete=SET_NULL,
        blank=True, null=True, verbose_name=_('Promocode'), db_index=True
    )

    is_inited = BooleanField(default=False, db_index=True, verbose_name=_('Is inited'))
    is_executed = BooleanField(default=False, db_index=True, verbose_name=_('Is executed'))
    is_paid = BooleanField(default=False, db_index=True, verbose_name=_('Is paid'))
    is_cancelled = BooleanField(default=False, db_index=True, verbose_name=_('Is cancelled'))
    is_refunded = BooleanField(default=False, db_index=True, verbose_name=_('Is refunded'))

    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')

    @property
    def service(self) -> OrderService:
        return OrderService(self)
