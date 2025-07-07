from __future__ import annotations

from decimal import Decimal

import httpx
from django.conf import settings

from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.providers.base import BasePaymentProvider
from .models import CKassaPayment


class CKassaProvider(BasePaymentProvider):
    system_name = 'ckassa'

    async def _create(self, amount: Decimal) -> CKassaPayment:
        data = {
            'servCode': settings.CKASSA_SERV_CODE,
            'startPaySelect': 'false',
            'amount': str(int(amount * 100)),
            'properties': [str(self.order.id)],
        }
        headers = {
            'ApiLoginAuthorization': settings.CKASSA_LOGIN,
            'ApiAuthorization': settings.CKASSA_TOKEN,
        }
        try:
            async with httpx.AsyncClient(base_url=settings.CKASSA_API_URL, timeout=30) as client:
                resp = await client.post('invoice/create2/', json=data, headers=headers)
                resp.raise_for_status()
                payment_url = resp.text.strip()
            payment = await CKassaPayment.objects.acreate(
                user=self.order.user,
                amount=amount,
                currency=self.order.currency,
                payment_url=payment_url,
            )
        except Exception as exc:
            raise PaymentException.InitError(f'CKassa init error: {exc}') from exc
        return payment
