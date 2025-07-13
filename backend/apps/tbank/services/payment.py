# tbank/services/payment.py
import logging
from typing import TYPE_CHECKING

from apps.commerce.services.payment.base import PaymentBaseService, PaymentAlreadyCanceled
from apps.tbank.classes.TBank import TBank

log = logging.getLogger('tbank')

if TYPE_CHECKING:
    from apps.tbank.models import TBankPayment


class TBankPaymentService(PaymentBaseService):
    """
    Логика TBank‑платежей, приведена к унифицированному контракту.
    """
    status: str

    def __init__(self, payment: 'TBankPayment') -> None:
        super().__init__(payment)  # Expected type 'Type[Payment]', got 'TBankPayment' instead

    @staticmethod
    async def actual_status(payment_id: int) -> str | None:
        response = await TBank().GetState(payment_id=payment_id)
        return response.get('Status')

    async def cancel(self):
        if self.payment.status == self.payment.Status.CANCELED:
            raise PaymentAlreadyCanceled()
        await TBank().Cancel(payment_id=str(self.payment.id))
        self.payment.status = self.payment.Status.CANCELED
        await self.payment.asave()
        log.info('[TBank] Payment %s canceled', self.payment.id)

    @staticmethod
    async def resend() -> None:
        """Resend unpaid notifications for the terminal."""
        await TBank().Resend()
