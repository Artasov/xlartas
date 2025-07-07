from django.db.models import CharField
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import Payment
from .services.payment import CKassaPaymentService


class CKassaPayment(Payment, CKassaPaymentService):
    reg_pay_num = CharField(_('RegPayNum'), max_length=20, blank=True, null=True)
    status = CharField(_('Status'), max_length=20, blank=True, null=True, db_index=True)

    class Meta:
        verbose_name = _('CKassa payment')
        verbose_name_plural = _('CKassa payments')
