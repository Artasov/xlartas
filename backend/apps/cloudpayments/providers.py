# cloudpayments/providers.py
from __future__ import annotations

from decimal import Decimal

from apps.cloudpayments.classes.payment import CloudPaymentAPI
from apps.cloudpayments.models import CloudPaymentPayment
from apps.commerce.models import Payment
from apps.commerce.providers.base import PaymentBaseProvider
from apps.commerce.services.payment.base import PaymentBaseService


class CloudPaymentsProvider(PaymentBaseProvider):
    """
    Интеграция CloudPayments (виджет, QR‑SBP, Apple / Google / ЮMoney‑Pay …).

    • system_name — ключ в `PaymentSystemRegistry`
    • `_create()` — заводит запись `CloudPaymentPayment`
      *и* инициирует сессию у CloudPayments API
    • `sync()` — подтягивает актуальный статус
    """

    system_name = 'cloud_payment'  # соответствует PaymentSystem.CloudPayment

    # --------------------------------------------------------------------- #
    async def _create(self, amount: Decimal) -> CloudPaymentPayment:
        """
        Создаём локальную модель и возвращаем её.
        Виджет CloudPayments открывается на фронте, поэтому URL не нужен.
        """
        try:
            payment: CloudPaymentPayment = await CloudPaymentAPI.init(
                user=self.order.user,
                amount=amount,
            )
        except Exception as exc:
            raise PaymentBaseService.exceptions.InitError(f'CloudPayments init error: {exc}') from exc

        return payment

    # --------------------------------------------------------------------- #
    async def cancel(self, payment: Payment) -> None:
        """
        Charge‑схема CloudPayments не предусматривает «Cancel».
        Отмена = Refund → реализуется отдельным use‑case'ом, здесь просто no‑op.
        """
        return None

    # --------------------------------------------------------------------- #
    async def sync(self, payment: Payment) -> None:
        """
        Обновляем локальный статус, запрашивая CloudPayments API.
        """
        if not isinstance(payment, CloudPaymentPayment):  # pragma: no cover
            return

        resp = await CloudPaymentAPI.actual_status(str(self.order.id))
        if resp['Success'] and payment.status != CloudPaymentPayment.Status.COMPLETED:
            payment.status = CloudPaymentPayment.Status.COMPLETED
            payment.is_paid = True
            await payment.asave()
