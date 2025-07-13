from decimal import Decimal

from apps.commerce.models import BalancePayment, PaymentSystem
from apps.commerce.providers.base import PaymentBaseProvider
from apps.commerce.services.payment.base import PaymentBaseService


class BalanceProvider(PaymentBaseProvider):
    system_name = PaymentSystem.Balance

    async def _create(self, amount: Decimal) -> BalancePayment:
        user = await self.order.arelated('user')
        if user.balance < amount:
            raise PaymentBaseService.exceptions.InitError('Not enough balance')
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
        await self.order.service.execute()
        return payment

    async def sync(self, payment: BalancePayment) -> None:
        return None
