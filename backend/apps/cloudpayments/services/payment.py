# cloudpayments/services/payment.py
from typing import TYPE_CHECKING

from apps.commerce.services.payment.base import PaymentAlreadyCanceled, BasePaymentService

if TYPE_CHECKING:
    pass


class CloudPaymentService(BasePaymentService):
    async def cancel(self) -> None:
        # API CloudPayments не поддерживает «cancel» для charge,
        # поэтому считаем платёж неизменяемым
        raise PaymentAlreadyCanceled()

    @staticmethod
    async def actual_status(invoice_id: str) -> bool:
        from apps.cloudpayments.classes.payment import CloudPaymentAPI
        resp = await CloudPaymentAPI.actual_status(invoice_id)
        return resp['Success']
