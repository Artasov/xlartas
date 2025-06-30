from __future__ import annotations

from decimal import Decimal

import hashlib
import urllib.parse

from django.conf import settings

from apps.freekassa.models import FreeKassaPayment
from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.providers.base import BasePaymentProvider


class FreeKassaProvider(BasePaymentProvider):
    system_name = 'freekassa'

    async def _create(self, amount: Decimal) -> FreeKassaPayment:
        """Create ``FreeKassaPayment`` with a payment form URL."""

        try:
            merchant_id = int(settings.FK_SHOP_ID)
            order_id = str(self.order.id)
            currency = self.order.currency
            amount_str = f"{amount:.2f}"
            sign_string = f"{merchant_id}:{amount_str}:{settings.FK_SECRET_WORD1}:{currency}:{order_id}"
            sign = hashlib.md5(sign_string.encode()).hexdigest()

            params = {
                "m": merchant_id,
                "oa": amount_str,
                "currency": currency,
                "o": order_id,
                "s": sign,
                "i": 42,
                "lang": "ru",
                "pay": "PAY",
                "em": self.order.user.email or "",
                "phone": getattr(self.order.user, "phone", "") or "",
            }
            payment_url = "https://pay.fk.money/" + "?" + urllib.parse.urlencode(params)

            payment = await FreeKassaPayment.objects.acreate(
                user=self.order.user,
                amount=amount,
                currency=currency,
                payment_url=payment_url,
            )
        except Exception as exc:
            raise PaymentException.InitError(f"FreeKassa init error: {exc}") from exc

        return payment
