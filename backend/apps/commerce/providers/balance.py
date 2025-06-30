from decimal import Decimal

from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.models import BalancePayment, PaymentSystem
from apps.commerce.providers.base import BasePaymentProvider


class BalanceProvider(BasePaymentProvider):
    system_name = PaymentSystem.Balance

    async def _create(self, amount: Decimal) -> BalancePayment:
        user = await self.order.arelated('user')
        if user.balance < amount:
            raise PaymentException.InitError('Not enough balance')
        user.balance -= amount
        await user.asave()
        payment = await BalancePayment.objects.acreate(
            user=user,
            amount=amount,
            currency=self.order.currency,
            payment_url=None,
            is_paid=True,
        )
        self.order.payment = payment
        self.order.is_paid = True
        await self.order.asave()
        await payment.asave()
        await self.order.execute()
        return payment
