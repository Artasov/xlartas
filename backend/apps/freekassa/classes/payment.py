import hashlib
import hmac
import time
from decimal import Decimal
from typing import Any, Dict

import httpx
from adjango.utils.base import apprint
from django.conf import settings

from apps.commerce.models.payment import Currency
from apps.freekassa.models import FreeKassaPayment


class FreeKassaAPI:
    base_url = settings.FK_API_URL

    @staticmethod
    def _signature(data: Dict[str, Any]) -> str:
        ordered = dict(sorted(data.items()))
        message = '|'.join(str(v) for v in ordered.values())
        return hmac.new(settings.FK_API_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()

    @classmethod
    async def create_order(
            cls,
            *,
            user,
            amount: Decimal,
            payment_id: str,
            email: str,
            ip: str,
            i: int = 6,
            currency: str = Currency.RUB,
    ) -> FreeKassaPayment:
        data = {
            'shopId': int(settings.FK_SHOP_ID),
            'nonce': int(time.time()),
            'paymentId': payment_id,
            'i': i,
            'email': email,
            'ip': ip,
            'amount': float(amount),
            'currency': currency,
        }
        data['signature'] = cls._signature(data)
        await apprint('FK order create request data')
        await apprint(data)
        async with httpx.AsyncClient(base_url=cls.base_url, timeout=10) as client:
            resp = await client.post('orders/create', json=data)
            resp.raise_for_status()
            j = resp.json()

        await apprint('FK order create response data')
        await apprint(j)
        order_id = j.get('orderId')
        order_hash = j.get('orderHash')
        location = j.get('location')
        payment = await FreeKassaPayment.objects.acreate(
            user=user,
            amount=amount,
            currency=currency,
            fk_order_id=order_id,
            order_hash=order_hash,
            payment_url=location,
        )
        return payment
