# cloudpayments/models.py
from adjango.models import AModel
from django.db.models import (
    Model, CharField, TextChoices, BigIntegerField, )
from django.utils.translation import gettext_lazy as _

from .services.payment import CloudPaymentService
from ..commerce.models import Payment


class CloudPaymentPayment(Payment, CloudPaymentService):
    """
    Платёж CloudPayments. Храним id транзакции в CP и её статус.
    """

    class Status(TextChoices):
        CREATED = 'Created', _('Created')
        AUTHORIZED = 'Authorized', _('Authorized')
        COMPLETED = 'Completed', _('Completed')
        DECLINED = 'Declined', _('Declined')
        REFUNDED = 'Refunded', _('Refunded')

    transaction_id = BigIntegerField(_('CloudPayments transaction id'), null=True, default=None)
    status = CharField(_('Status'), choices=Status.choices, max_length=20, db_index=True)

    class Meta:
        verbose_name = _('CloudPaymentAPI')
        verbose_name_plural = _('CloudPayments')
