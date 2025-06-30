from __future__ import annotations

import hmac
import hashlib
import time
from typing import Any, Dict

import httpx
from django.conf import settings

from apps.commerce.services.payment.base import BasePaymentService, PaymentAlreadyCanceled


class FreeKassaPaymentService(BasePaymentService):
    @staticmethod
    async def actual_status(fk_order_id: int) -> int | None:
        data = {
            'shopId': int(settings.FK_SHOP_ID),
            'nonce': int(time.time()),
            'orderId': fk_order_id,
        }
        sign = FreeKassaPaymentService._signature(data)
        data['signature'] = sign
        async with httpx.AsyncClient(base_url=settings.FK_API_URL, timeout=10) as client:
            resp = await client.post('orders', json=data)
            resp.raise_for_status()
            j = resp.json()
        orders = j.get('orders')
        if orders:
            return int(orders[0]['status'])
        return None

    async def cancel(self) -> None:
        raise PaymentAlreadyCanceled()

    @staticmethod
    def _signature(data: Dict[str, Any]) -> str:
        ordered = dict(sorted(data.items()))
        message = '|'.join(str(v) for v in ordered.values())
        return hmac.new(settings.FK_API_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()
