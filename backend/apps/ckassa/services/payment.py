from __future__ import annotations

from typing import Optional, TYPE_CHECKING

import httpx
from django.conf import settings

from apps.commerce.services.payment.base import PaymentBaseService

if TYPE_CHECKING:
    from apps.ckassa.models import CKassaPayment


class CKassaPaymentService(PaymentBaseService):

    def __init__(self, payment: 'CKassaPayment') -> None:
        super().__init__(payment)  # Expected type 'Type[Payment]', got 'CKassaPayment' instead

    @staticmethod
    async def actual_status(reg_pay_num: str) -> Optional[str]:
        headers = {
            'ApiLoginAuthorization': settings.CKASSA_LOGIN,
            'ApiAuthorization': settings.CKASSA_TOKEN,
        }
        async with httpx.AsyncClient(base_url=settings.CKASSA_API_URL, timeout=30) as client:
            resp = await client.get('payments/new', headers=headers)
            resp.raise_for_status()
            j = resp.json()
        for pay in j.get('payments', []):
            if str(pay.get('regPayNum')) == str(reg_pay_num):
                return pay.get('state')
        return None

    async def cancel(self) -> None:
        raise NotImplementedError()
