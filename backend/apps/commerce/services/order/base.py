# commerce/services/order/base.py
import logging
from decimal import Decimal
from typing import TYPE_CHECKING, Union

from adrf.requests import AsyncRequest
from django.core.handlers.asgi import ASGIRequest
from django.core.handlers.wsgi import WSGIRequest

from apps.cloudpayments.classes.payment import CloudPaymentAPI
from apps.commerce.exceptions.order import OrderException
from apps.commerce.exceptions.payment import PaymentException

tbank_log = logging.getLogger('tbank')
commerce_log = logging.getLogger('commerce')

if TYPE_CHECKING:
    from apps.commerce.models import Order, HandMadePayment


class OrderService:
    """
    Интерфейс-сервис для работы с заказами, частично реализующий функционал.
    Этот класс должен быть унаследован конкретными сервисами заказов,
    которые реализуют свою специфическую логику для создания различных типов заказов.

    @method init: Метод для инициализации заказа.
    @method execute: Метод для выполнения заказа.
    """

    # ---------------------------------------------------------------- #
    #   ИНИЦИАЛИЗАЦИЯ ПЛАТЕЖА
    # ---------------------------------------------------------------- #
    async def init_payment(
            self: 'Order', request: AsyncRequest, price: Decimal,
    ):
        from apps.commerce.services.payment_registry import PaymentSystemRegistry
        available = PaymentSystemRegistry.available_systems(self.currency)
        if self.payment_system not in available:
            raise PaymentException.CurrencyNotSupportedForPaymentSystem()

        from apps.commerce.providers.base import BasePaymentProvider
        provider_cls: type[BasePaymentProvider] = (
            PaymentSystemRegistry.provider_cls(self.payment_system)
        )
        commerce_log.info(f'Using {provider_cls} provider')
        payment = await provider_cls.create(order=self, request=request, amount=price)
        self.payment = payment  # noqa
        await self.asave()

    @property
    async def receipt_price(self: 'Order'):
        """
        Возвращает финальную сумму для чека.
        """
        price_row = await self.product.prices.agetorn(currency=self.currency)  # noqa
        if not price_row:
            # Если нет строки цены, 0
            return Decimal('0')

        # Для большинства заказов используется базовая цена продукта
        price = price_row.amount

        # Если есть промокод, учитываем скидку
        if self.promocode:
            price = await self.promocode.calc_price_for_order(order=self)

        return price

    async def safe_cancel(
            self: 'Order',
            request: AsyncRequest | WSGIRequest | ASGIRequest,
            reason: str
    ):
        if not any((self.is_inited, self.is_executed, self.is_paid, self.is_cancelled, self.is_refunded)):
            await self.cancel(request=request, reason=reason)  # noqa
        elif self.is_cancelled:
            raise OrderException.AlreadyCanceled()
        elif self.is_paid:
            raise OrderException.CannotCancelPaid()
        elif self.is_refunded:
            raise OrderException.CannotCancelRefunded()
        elif self.is_inited and not any((self.is_executed, self.is_cancelled, self.is_paid)):
            await self.cancel(request=request, reason=reason)  # noqa

    async def init(self: 'Order', request, init_payment: bool = True):
        commerce_log.info(f'Start init order {self.id}')
        self.product = await self.arelated('product')
        self.product: Product = await self.product.aget_real_instance()  # noqa # Тут тоже неверная типизация.
        commerce_log.info(f'For product {self.product.name}')  # noqa
        price = await self.receipt_price  # noqa
        commerce_log.info(f'Price: {price}')
        self.amount = price  # noqa
        await self.asave()
        await self.product.can_pregive(self, raise_exceptions=True)  # noqa
        commerce_log.info(f'Pregive process product {self.product.name}')  # noqa
        await self.product.pregive(self)  # noqa
        if self.payment_system and init_payment and price > 0:
            await self.init_payment(  # noqa
                request, price
            )  # TODO: Unresolved attribute reference 'init_payment' for class 'Order'
        self.is_inited = True  # noqa
        await self.asave()

    async def sync_with_payment_system(self: 'Order'):
        from apps.cloudpayments.classes.payment import CloudPaymentAPI
        from apps.tbank.models import TBankPayment
        from apps.cloudpayments.models import CloudPaymentPayment
        from apps.commerce.models.payment import HandMadePayment
        payment = await self.arelated('payment')
        if isinstance(self.payment, TBankPayment):
            payment: TBankPayment
            tbank_log.info(f'TBank Payment synchronization......')
            actual_status = await payment.actual_status(payment_id=payment.id)
            if actual_status != payment.status:
                payment.status = actual_status
                await payment.asave()
            if ((payment.status == TBankPayment.Status.CONFIRMED or payment.status == TBankPayment.Status.AUTHORIZED)
                    and not self.is_executed and not self.is_refunded):
                await self.execute()  # noqa
            tbank_log.info(f'TBank Payment {payment.id} synchronization successfully.')
        elif isinstance(payment, CloudPaymentPayment):
            status = await CloudPaymentAPI.actual_status(payment)  # noqa
            if (status == CloudPaymentPayment.Status.COMPLETED
                    and not self.is_executed and not self.is_refunded):
                await self.execute()  # noqa
        elif isinstance(self.payment, HandMadePayment):
            pass  # Ручная оплата, и тут ничего не надо
        else:
            raise PaymentException.PaymentSystemNotFound()

    async def execute(self: 'Order'):
        """
        Выполнение заказа после оплаты.
        Отвечает за выполнение операций после оплаты заказа. Выдача товара в том или ином виде,
        обновление моделей оплат, отправка уведомлений если нужно и т.д.
        """
        from apps.commerce.models import PromocodeUsage
        if self.is_refunded: raise OrderException.CannotExecuteRefunded()
        if self.is_executed: raise OrderException.AlreadyExecuted()
        self.product = await self.arelated('product')
        self.product = await self.product.aget_real_instance()  # noqa
        await self.product.postgive(self)  # noqa
        if self.promocode_id:
            await PromocodeUsage.objects.acreate(
                user_id=self.user_id, promocode_id=self.promocode_id,
            )
        self.is_executed = True  # noqa
        await self.asave()
        commerce_log.info(f'Order {self.id} EXECUTED successfully')

    async def cancel(
            self: Union['Order', 'OrderService'],
            request: AsyncRequest | WSGIRequest | ASGIRequest,
            reason: str
    ):
        if getattr(self, 'payment_id'):
            await self.cancel_payment()
        self.product = await self.arelated('product')  # noqa
        await self.product.cancel_given(request=request, order=self, reason=reason)
        self.is_cancelled = True  # noqa
        await self.asave()

    def check_available_to_init_payment(self: Union['Order', 'OrderService']):
        from apps.commerce.models import Order
        from apps.commerce.models.payment import CurrencyPaymentSystemMapping
        self: Order
        available_payment_systems = CurrencyPaymentSystemMapping.get_payment(self.currency)
        if not available_payment_systems:
            tbank_log.info(f'Валюта {self.currency} не поддерживается.')
            raise PaymentException.CurrencyNotSupported(f'Валюта {self.currency} не поддерживается.')
        if self.payment_system not in available_payment_systems:
            tbank_log.info(f'Платежная система {self.payment_system} не поддерживается для валюты {self.currency}.')
            raise PaymentException.CurrencyNotSupportedForPaymentSystem(
                f'Платежная система {self.payment_system} не поддерживается для валюты {self.currency}.'
            )

    async def cancel_payment(self: Union['Order', 'OrderService']):
        """Отменяет только платеж в шлюзе."""
        await self.sync_with_payment_system()
        from apps.tbank.models import TBankPayment
        from apps.commerce.models.payment import HandMadePayment
        from apps.cloudpayments.models import CloudPaymentPayment
        if isinstance(self.payment, TBankPayment):
            payment: TBankPayment = await self.arelated('payment')
            if payment.is_paid:
                tbank_log.info(f'TBank Payment {payment.id} cannot cancel paid.')
                raise OrderException.CannotCancelPaid()
            else:
                await self.payment.cancel()
        elif isinstance(self.payment, CloudPaymentPayment):
            await CloudPaymentAPI.cancel(self.payment)  # noqa # TODO: Не реализовано
        elif isinstance(self.payment, HandMadePayment):
            pass  # Ручная оплата, отмена тоже ручная
        else:
            commerce_log.info(f'Payment system {self.payment_system} not found')
            raise PaymentException.PaymentSystemNotFound()
