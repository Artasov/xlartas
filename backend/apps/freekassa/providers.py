from __future__ import annotations

from decimal import Decimal

from apps.freekassa.classes.payment import FreeKassaAPI
from apps.freekassa.models import FreeKassaPayment
from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.providers.base import BasePaymentProvider


class FreeKassaProvider(BasePaymentProvider):
    system_name = 'freekassa'

    async def _create(self, amount: Decimal) -> FreeKassaPayment:
        try:
            payment = await FreeKassaAPI.create_order(
                user=self.order.user,
                amount=amount,
                payment_id=str(self.order.id),
                email=self.order.user.email or '',
                ip=self.request.ip,
            )
        except Exception as exc:
            raise PaymentException.InitError(f'FreeKassa init error: {exc}') from exc
        return payment
