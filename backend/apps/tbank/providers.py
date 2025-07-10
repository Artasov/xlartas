# tbank/providers.py
from decimal import Decimal
from typing import TYPE_CHECKING

from adjango.utils.base import build_full_url

from apps.commerce.providers.base import BasePaymentProvider
from apps.tbank.classes.TBank import (
    TBank, ReceiptFFD105, ItemFFD105, Payments,
    OperationInitiatorType, SUCCESS_FAILURE_GET_PARAMS_TEMPLATE
)
from apps.tbank.managers.customer import TBankCustomerManager
from apps.tbank.models import TBankPayment, TBankInstallment
from apps.commerce.models import Payment

if TYPE_CHECKING:  # pragma: no cover
    pass


class _TBankBaseProvider(BasePaymentProvider):  # noqa
    async def _get_customer_key(self) -> str:
        customer = await TBankCustomerManager.get_or_init(
            user_id=self.order.user.id,
            ip=self.request.ip,
            email=self.order.user.email,
            phone=getattr(self.order.user, 'phone', None)
        )
        return customer.key


class TBankPaymentProvider(_TBankBaseProvider):
    system_name = 'tbank'

    async def _create(self, amount: Decimal):
        from apps.commerce.models import Currency

        tbank = TBank()
        customer_key = await self._get_customer_key()
        price_cents = int(amount * 100)

        redirect_url = build_full_url('tbank:notification') + SUCCESS_FAILURE_GET_PARAMS_TEMPLATE

        items = [ItemFFD105(
            Name=self.order.product.name,  # noqa
            Price=price_cents,
            Quantity=1,
            Amount=price_cents,
            PaymentMethod='full_payment',
            PaymentObject='service',
            Tax='none',
        )]

        response = await tbank.Init(
            amount=price_cents,
            order_id=self.order.id,
            receipt=ReceiptFFD105(
                Items=items,
                Email=self.order.user.email,
                Phone=self.order.user.phone,
                Taxation='usn_income',
                Payments=Payments(Electronic=price_cents),
            ),
            customer_key=customer_key,
            data={'order_id': self.order.id},
            language='ru',
            operation_initiator_type=OperationInitiatorType.CIT_CNC,
            notification_url='https://xlartas.ru/tbank/callback/',
            success_url=redirect_url,
            fail_url=redirect_url,
        )

        return await TBankPayment.objects.acreate(
            id=response['PaymentId'],
            user=self.order.user,
            amount=Decimal(response['Amount']) / 100,
            currency=Currency.RUB,
            customer_id=None,  # заполнили выше
            order_id=response['OrderId'],
            status=response['Status'],
            payment_url=response['PaymentURL'],
        )

    async def sync(self, payment: Payment) -> None:
        from apps.tbank.services.payment import TBankPaymentService
        if not isinstance(payment, TBankPayment):
            return

        status = await TBankPaymentService.actual_status(payment.id)
        if status and status != payment.status:
            payment.status = status
            await payment.asave()

        if status in (TBankPayment.Status.CONFIRMED, TBankPayment.Status.AUTHORIZED):
            if not payment.is_paid:
                payment.is_paid = True
                await payment.asave()


class TBankInstallmentProvider(_TBankBaseProvider):
    system_name = 'tbank_installment'

    async def _create(self, amount: Decimal):
        """
        Создаём Payment‑рассрочку через Forma.
        """
        from apps.tbank.services.installment import TBankInstallmentService
        from apps.commerce.models import Currency

        payment: TBankInstallment = await TBankInstallment.objects.acreate(
            user=self.order.user,
            amount=amount,
            currency=Currency.RUB,
            order_id=self.order.id,
        )

        # Параметры для create_installment:
        items = [{
            'name': self.order.product.name,  # noqa
            'quantity': 1,
            'price': int(amount),
            'category': 'service',
        }]
        await TBankInstallmentService.create_installment(
            payment,
            total_sum=int(amount),
            items=items,
            webhook_url='https://xlartas.ru/tinkoff/callback/',
            success_url='https://xlartas.ru/orders/installment/',
            fail_url='https://xlartas.ru/orders/installment/',
            return_url='https://xlartas.ru/orders/installment/',
        )
        return payment
