# ckassa/providers.py
from __future__ import annotations

import logging
from decimal import Decimal

import httpx
from adjango.utils.base import apprint
from django.conf import settings

from apps.commerce.providers.base import PaymentBaseProvider
from .models import CKassaPayment
from ..commerce.services.payment.base import PaymentBaseService

logger = logging.getLogger(__name__)


class CKassaProvider(PaymentBaseProvider):
    system_name = 'ckassa'

    async def _create(self, amount: Decimal) -> CKassaPayment:
        data = {
            'servCode': settings.CKASSA_SERV_CODE,
            'startPaySelect': 'false',
            'amount': str(int(amount * 100)),
            'properties': [str(self.order.id)[:12]],
        }
        headers = {
            'ApiLoginAuthorization': settings.CKASSA_LOGIN,
            'ApiAuthorization': settings.CKASSA_TOKEN,
        }
        logger.debug('Starting CKassa payment initialization')
        async with httpx.AsyncClient(base_url=settings.CKASSA_API_URL, timeout=30) as client:
            resp = await client.post('invoice/create2/', json=data, headers=headers)

            # Сначала читаем тело как текст, чтобы логировать даже при 500
            resp_text = resp.text
            await apprint(f'CKassa status: {resp.status_code}')
            await apprint(f'CKassa request headers: {headers}')
            await apprint(f'CKassa request body: {data}')
            await apprint(f'CKassa raw response text: {resp_text}')

            # Пытаемся разобрать JSON, но не прерываемся, если он некорректен
            try:
                json_ = resp.json()
                await apprint(f'CKassa parsed JSON: {json_}')
            except Exception as json_exc:
                await apprint(f'CKassa JSON decode error: {json_exc}')

            # Явно проверяем код ответа и бросаем, если не 2xx
            if resp.status_code >= 400:
                raise PaymentBaseService.exceptions.InitError(
                    f'CKassa init error: status {resp.status_code}, response: {resp_text}'
                )

            # Если всё ок — URL платежа обычно в теле (или в JSON, по документации)
            payment_url = resp_text.strip()

        payment = await CKassaPayment.objects.acreate(
            user=self.order.user,
            amount=amount,
            currency=self.order.currency,
            payment_url=payment_url,
        )

        return payment

    async def sync(self, payment: CKassaPayment) -> None:
        from .services.payment import CKassaPaymentService

        if not isinstance(payment, CKassaPayment):
            return

        status = await CKassaPaymentService.actual_status(payment.reg_pay_num)
        if status and status != payment.status:
            payment.status = status
            await payment.asave()
