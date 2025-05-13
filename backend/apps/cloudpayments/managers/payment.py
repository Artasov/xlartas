import logging
from decimal import Decimal
from typing import Any, Dict, Optional

import httpx
from django.conf import settings

from apps.cloudpayments.models import CloudPaymentPayment
from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.models.payment import Currency

log = logging.getLogger('cloud_payment')


class CloudPaymentAPI:
    """
    Асинхронный менеджер для взаимодействия с CloudPayments API
    (одностадийная «charge»‑схема).
    """
    base_url = 'https://api.cloudpayments.ru'

    # --------------------------------------------------------------------- #
    # PRIVATE
    # --------------------------------------------------------------------- #
    @staticmethod
    def _auth() -> tuple[str, str]:
        return settings.CLOUD_PAYMENT_PUBLIC_ID, settings.CLOUD_PAYMENT_PASSWORD

    @classmethod
    async def _post(
            cls,
            endpoint: str,
            data: Dict[str, Any],
            *,
            idempotency_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        headers = {'Content-Type': 'application/json'}
        if idempotency_key:
            headers['X-Request-Id'] = idempotency_key

        async with httpx.AsyncClient(base_url=cls.base_url, auth=cls._auth(), timeout=30) as client:
            log.debug('[CP] Request: %s', data)
            r = await client.post(endpoint, json=data, headers=headers)
            log.debug('[CP] Response: %s', r.text)
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as exc:
            log.error('[CP] HTTP error %s – %s', exc.response.status_code, exc.response.text)
            raise PaymentException.InitError()

        j = r.json()
        if not j.get('Success', False):
            log.error('[CP] API error – %s', j.get('Message'))
            raise PaymentException.InitError(j.get('Message') or 'CloudPayments error')
        return j

    # --------------------------------------------------------------------- #
    # PUBLIC
    # --------------------------------------------------------------------- #
    @classmethod
    async def init_sbp(cls, *, user, amount: Decimal, order_id, ip, description, email=None):
        """Создаём QR‑ссылку SBP (`/payments/qr/sbp/link`)."""
        data = {
            'PublicId': settings.CLOUD_PAYMENT_PUBLIC_ID,
            'Amount': float(amount),
            'Currency': Currency.RUB,
            'InvoiceId': str(order_id),
            'Scheme': 'charge',
            'Description': description,
            'AccountId': str(user.id) if user else '',
            'Email': email,
            'IpAddress': ip,
        }
        resp = await cls._post('/payments/qr/sbp/link', data)
        model = resp['Model']
        return await CloudPaymentPayment.objects.acreate(
            amount=amount,
            currency=Currency.RUB,
            user=user,
            payment_url=model['QrUrl'],
            transaction_id=model['TransactionId'],
            status=model['Message'] or CloudPaymentPayment.Status.CREATED,
            is_paid=False,
        )

    @classmethod
    async def init(cls, *, user, amount: Decimal, order_id, ip,
                   description, email=None, card_token: str | None = None):
        """
        Одностадийная картовая оплата.
        * card_token — криптограмма от CloudPayments
        """
        data = {
            "Amount": float(amount),
            "Currency": Currency.RUB,
            "InvoiceId": str(order_id),
            "AccountId": str(user.id) if user else '',
            "Description": description,
            "Email": email,
            "IpAddress": ip,
            "Token": card_token,  # либо CryptogramPacket
        }
        resp = await cls._post('/payments/cards/charge', data)
        model = resp['Model']
        return await CloudPaymentPayment.objects.acreate(
            amount=amount,
            currency=Currency.RUB,
            user=user,
            payment_url=None,  # карты сразу в виджете
            transaction_id=model['TransactionId'],
            status=model['Status'],
            is_paid=model['Status'] == 'Completed',
        )

    @classmethod
    async def actual_status(cls, payment: CloudPaymentPayment) -> str:
        """
        Возвращает актуальный статус из API и, если изменился, сохраняет модель.
        """
        data = {'TransactionId': payment.transaction_id}
        resp = await cls._post('/payments/get', data)
        status = resp['Model']['Status']
        if status != payment.status:
            payment.status = status
            if status == CloudPaymentPayment.Status.COMPLETED:
                payment.is_paid = True
            await payment.asave(update_fields=('status', 'is_paid', 'updated_at'))
        return status

    @classmethod
    async def cancel(cls, payment: CloudPaymentPayment):
        data = {'TransactionId': payment.transaction_id}
        await cls._post('/payments/void', data)
        payment.status = CloudPaymentPayment.Status.DECLINED
        await payment.asave(update_fields=('status', 'updated_at'))

    @classmethod
    async def refund(cls, payment: CloudPaymentPayment, amount: Decimal | None = None):
        data = {'TransactionId': payment.transaction_id,
                'Amount': float(amount or payment.amount)}
        await cls._post('/payments/refund', data)
        payment.status = CloudPaymentPayment.Status.REFUNDED
        await payment.asave(update_fields=('status', 'is_paid', 'updated_at'))
