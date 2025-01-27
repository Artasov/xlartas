# commerce/models/order.py
from adjango.models import APolymorphicModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import (
    ForeignKey, SET_NULL, CharField, BooleanField
)
from django.utils.translation import gettext_lazy as _

from apps.commerce.managers.order import OrderBaseManager
from apps.commerce.models.payment import ACurrencyMixin, PaymentSystem
from apps.uuid6.field import UUIDv6Field


class Order(
    APolymorphicModel, ACurrencyMixin,
    ACreatedUpdatedAtIndexedMixin
):
    objects = OrderBaseManager()
    id = UUIDv6Field(primary_key=True, unique=True)
    user = ForeignKey('core.User', SET_NULL, 'orders', null=True, verbose_name=_('User'))
    payment = ForeignKey('commerce.Payment', SET_NULL, 'orders', null=True, blank=True, verbose_name=_('Payment'))
    payment_system = CharField(
        choices=PaymentSystem.choices, max_length=50, verbose_name=_('Payment System'),
        db_index=True
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
