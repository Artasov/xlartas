# cloudpayments/services/payment.py
from typing import TYPE_CHECKING

from apps.commerce.services.payment.base import PaymentAlreadyCanceled, PaymentBaseService

if TYPE_CHECKING:
    from apps.cloudpayments.models import CloudPaymentPayment


class CloudPaymentService(PaymentBaseService['CloudPaymentPayment']):

    def __init__(self, payment: 'CloudPaymentPayment') -> None:
        super().__init__(payment)  # Expected type 'Type[Payment]', got 'CloudPaymentPayment' instead

    async def cancel(self) -> None:
        # API CloudPayments не поддерживает «cancel» для charge,
        # поэтому считаем платёж неизменяемым
        raise PaymentAlreadyCanceled()

    @staticmethod
    async def actual_status(invoice_id: str) -> bool:
        from apps.cloudpayments.classes.payment import CloudPaymentAPI
        resp = await CloudPaymentAPI.actual_status(invoice_id)
        return resp['Success']
