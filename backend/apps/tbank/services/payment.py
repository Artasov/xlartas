# tbank/services/payment.py
import logging

from apps.commerce.services.payment.base import BasePaymentService, PaymentAlreadyCanceled
from apps.tbank.classes.TBank import TBank

log = logging.getLogger('tbank')


class TBankPaymentService(BasePaymentService):
    """
    Логика TBank‑платежей, приведена к унифицированному контракту.
    """
    status: str

    @staticmethod
    async def actual_status(payment_id: int) -> str | None:
        response = await TBank().GetState(payment_id=payment_id)
        return response.get('Status')

    async def cancel(self):
        from apps.tbank.models import TBankPayment
        self: TBankPayment
        if self.status == self.Status.CANCELED:
            raise PaymentAlreadyCanceled()
        await TBank().Cancel(payment_id=str(self.id))
        self.status = self.Status.CANCELED
        await self.asave()
        log.info('[TBank] Payment %s canceled', self.id)

    @staticmethod
    async def resend() -> None:
        """Resend unpaid notifications for the terminal."""
        await TBank().Resend()
