from typing import TYPE_CHECKING

from apps.commerce.services.payment import IPaymentService

if TYPE_CHECKING:
    from apps.commerce.models import Payment


class CloudPaymentService(IPaymentService):
    async def cancel(self: 'Payment'):
        pass

    @staticmethod
    async def actual_status(invoice_id: str) -> bool:
        """
        Возвращает актуальный статус из API и, если изменился, сохраняет модель.
        """
        from apps.cloudpayments.classes.payment import CloudPaymentAPI
        resp = await CloudPaymentAPI.actual_status(invoice_id)
        return resp['Success']
