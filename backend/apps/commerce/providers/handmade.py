# commerce/providers/handmade.py
from __future__ import annotations

from decimal import Decimal

from apps.commerce.models import HandMadePayment, PaymentSystem
from apps.commerce.providers.base import PaymentBaseProvider
from apps.commerce.services.payment.base import PaymentBaseService


class HandMadeProvider(PaymentBaseProvider):
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
            raise PaymentBaseService.exceptions.InitError(f'HandMade init error: {exc}') from exc
        return payment

    async def sync(self, payment: HandMadePayment) -> None:
        return None
