# commerce/providers/handmade.py
from __future__ import annotations

from decimal import Decimal

from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.models import HandMadePayment, PaymentSystem
from apps.commerce.providers.base import BasePaymentProvider


class HandMadeProvider(BasePaymentProvider):
    """
    Простейший «ручной» провайдер:
    • создаёт запись `HandMadePayment`;
    • URL не требуется — администратор помечает оплату вручную.
    """

    system_name = PaymentSystem.HandMade

    async def _create(self, amount: Decimal) -> HandMadePayment:
        try:
            payment = await HandMadePayment.objects.acreate(
                user=self.order.user,
                amount=amount,
                currency=self.order.currency,
                payment_url=None,
            )
        except Exception as exc:
            raise PaymentException.InitError(f'HandMade init error: {exc}') from exc
        return payment

    async def sync(self, payment: HandMadePayment) -> None:
        return None
