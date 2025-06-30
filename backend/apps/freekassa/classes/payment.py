# apps/freekassa/classes/payment.py
import hashlib
import hmac
import secrets
import time
from decimal import Decimal
from enum import Enum
from pprint import pprint
from typing import Any, Dict

import httpx
from adjango.utils.base import apprint
from django.conf import settings

from apps.commerce.models.payment import Currency  # Enum TextChoices
from apps.freekassa.models import FreeKassaPayment


class FreeKassaAPI:
    base_url = settings.FK_API_URL

    # ------------------------- helpers -------------------------

    @staticmethod
    def _primitive(value: Any) -> Any:
        """
        Приводит Enum-ы и их наследников (TextChoices) к .value,
        оставляя остальные типы как есть.
        """
        return value.value if isinstance(value, Enum) else value

    @classmethod
    def _signature(cls, data: Dict[str, Any]) -> str:
        """
        1. Сортируем ключи по алфавиту;
        2. Берём ТОЛЬКО «примитивные» значения (Enum → .value);
        3. Склеиваем через “|”;
        4. HMAC-SHA256 по API-ключу.
        """
        # ── ГЕНЕРАТОР → СПИСОК ────────────────────────────────────────────
        ordered_values = [
            cls._primitive(v) for _, v in sorted(data.items())
        ]
        print('ordered_values')
        print(ordered_values)
        message = '|'.join(map(str, ordered_values))

        # ---------- DEBUG ----------
        pprint('Signature message')
        pprint(message)
        # ---------------------------

        return hmac.new(
            settings.FK_API_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

    # —― гарантированно уникальный и монотонно возрастающий nonce ―—
    @staticmethod
    def _nonce() -> int:
        """
        Возвращает целое число миллисекунд от эпохи + случайный хвост 0-999.
        Вероятность повтора даже при бурстовой нагрузке ≈ 0.
        """
        return int(time.time() * 1000) * 1000 + secrets.randbelow(1000)

    # ------------------------- public --------------------------

    @classmethod
    async def create_order(
            cls,
            *,
            user,
            amount: Decimal,
            payment_id: str,
            email: str,
            ip: str,
            i: int = 44,
            currency: str | Currency = Currency.RUB,
    ) -> FreeKassaPayment:
        """
        Создаём заказ в FreeKassa и сохраняем локальную модель Payment.
        """
        # Enum → строка
        currency_code: str = currency.value if isinstance(currency, Enum) else str(currency)

        data: Dict[str, Any] = {
            'shopId': int(settings.FK_SHOP_ID),
            'nonce': cls._nonce(),
            'paymentId': payment_id,
            'i': int(i),
            'email': email,
            'ip': ip,
            'amount': f'{amount:.2f}',
            'currency': currency_code,
        }
        data['signature'] = cls._signature(data)

        # ---------- DEBUG ----------
        await apprint('FK order create request data')
        await apprint(data)
        # ---------------------------

        async with httpx.AsyncClient(base_url=cls.base_url, timeout=10) as client:
            resp = await client.post('orders/create', json=data)
        # если статус 401 — поднимет исключение и уйдём в except вызывающего кода
        payload = resp.json()

        await apprint('FK order create response data')
        await apprint(payload)
        resp.raise_for_status()

        payment = await FreeKassaPayment.objects.acreate(
            user=user,
            amount=amount,
            currency=currency_code,
            fk_order_id=payload.get('orderId'),
            order_hash=payload.get('orderHash'),
            payment_url=payload.get('location'),
        )
        return payment
