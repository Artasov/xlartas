from __future__ import annotations

import hashlib
import urllib.parse
from decimal import Decimal

from django.conf import settings
from apps.commerce.providers.base import PaymentBaseProvider
from apps.commerce.services.payment.base import PaymentBaseService
from apps.freekassa.models import FreeKassaPayment


class FreeKassaProvider(PaymentBaseProvider):
    system_name = 'freekassa'

    async def _create(self, amount: Decimal) -> FreeKassaPayment:
        """
        Создать объект FreeKassaPayment и сгенерировать ссылку на оплату.
        Подпись формируется по схеме:
            md5(<shop_id>:<amount>:<secret#1>:<currency>:<order_id>)
        Документация: https://docs.freekassa.ru  (§1.5)
        """
        try:
            merchant_id: int = int(settings.FK_SHOP_ID)
            order_id: str = str(self.order.id)
            # 1. Сумма ― одна строка для всех мест (без лишних нулей)
            amount_str: str = format(amount.normalize(), 'f')
            # 2. Валюта в верхнем регистре
            currency: str = self.order.currency.upper()
            # 3. Подпись
            sign_string = f'{merchant_id}:{amount_str}:{settings.FK_SECRET_WORD1}:{currency}:{order_id}'
            sign = hashlib.md5(sign_string.encode('utf-8')).hexdigest()
            # 4. Параметры формы
            params = {
                'm': merchant_id,
                'oa': amount_str,
                'currency': currency,
                'o': order_id,
                's': sign,
                # необязательные
                # "i": 1,
                'lang': 'ru',
                'pay': 'PAY',
                'em': getattr(self.order.user, 'email', '') or '',
                'phone': getattr(self.order.user, 'phone', '') or '',
            }
            payment_url = 'https://pay.fk.money/?' + urllib.parse.urlencode(params)
            # 5. Создаём запись в БД
            payment = await FreeKassaPayment.objects.acreate(
                user=self.order.user,
                amount=amount,
                currency=currency,
                payment_url=payment_url,
            )
        except Exception as exc:
            raise PaymentBaseService.exceptions.InitError(f'FreeKassa init error: {exc}') from exc
        return payment

    async def sync(self, payment: FreeKassaPayment) -> None:
        from apps.freekassa.services.payment import FreeKassaPaymentService

        if not isinstance(payment, FreeKassaPayment):
            return

        if payment.fk_order_id is None:
            return

        status = await FreeKassaPaymentService.actual_status(payment.fk_order_id)
        if status is not None and status != payment.status:
            payment.status = status
            if status == FreeKassaPayment.Status.PAID:
                payment.is_paid = True
            await payment.asave()
