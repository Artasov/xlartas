from django.db.models import BigIntegerField, IntegerField, CharField, IntegerChoices
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import Payment
from .services.payment import FreeKassaPaymentService


class FreeKassaPayment(Payment, FreeKassaPaymentService):
    class Status(IntegerChoices):
        NEW = 0, _('New')
        PAID = 1, _('Paid')
        REFUND = 6, _('Refund')
        ERROR = 8, _('Error')
        CANCEL = 9, _('Cancel')

    fk_order_id = BigIntegerField(_('FreeKassa order ID'), null=True, blank=True)
    order_hash = CharField(_('Order hash'), max_length=64, blank=True, null=True)
    status = IntegerField(_('Status'), choices=Status.choices, default=Status.NEW, db_index=True)

    class Meta:
        verbose_name = _('FreeKassa payment')
        verbose_name_plural = _('FreeKassa payments')
