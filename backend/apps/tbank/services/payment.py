# tbank/services/payment.py
import logging

from apps.commerce.exceptions.order import OrderException
from apps.commerce.services.payment import IPaymentService
from apps.tbank.classes.TBank import TBank

log = logging.getLogger('tbank')


class TBankPaymentService(IPaymentService):
    @staticmethod
    async def actual_status(payment_id: int) -> str | None:
        """
        Обновляет статус платежа, запрашивая актуальную информацию у банка.
        """
        from apps.tbank.models import TBankPayment
        self: TBankPayment
        response = await TBank().GetState(payment_id=payment_id)
        return response.get('Status')

    async def cancel(self):
        """ Отменяет платеж или делает возврат. """
        log.info(f'TBank Payment canceling......')
        from apps.tbank.models import TBankPayment
        self: TBankPayment
        if self.status == self.Status.CANCELED:
            raise OrderException.AlreadyCanceled()
        else:
            await TBank().Cancel(payment_id=str(self.id))
            self.status = self.Status.CANCELED
            await self.asave()
        log.info(f'TBank Payment {self.id} cancelled successfully.')

    @staticmethod
    async def resend():
        """ Отменяет платеж или делает возврат. """
        from apps.tbank.models import TBankPayment
        self: TBankPayment
        await TBank().Resend()
