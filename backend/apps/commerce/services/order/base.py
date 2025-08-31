# commerce/services/order/base.py
import logging
from decimal import Decimal
from typing import TYPE_CHECKING, Generic

from adjango.services.base import ABaseService

from apps.commerce.services.order.exceptions import _OrderException
from apps.commerce.services.payment.base import PaymentBaseService
from apps.commerce.services.typing import OrderT, ProductT
from apps.core.services.base import BaseService

tbank_log = logging.getLogger('tbank')
commerce_log = logging.getLogger('commerce')

if TYPE_CHECKING:
    pass


class OrderService(ABaseService):
    """
    Интерфейс-сервис для работы с заказами, частично реализующий функционал.
    Этот класс должен быть унаследован конкретными сервисами заказов,
    которые реализуют свою специфическую логику для создания различных типов заказов.

    @method init: Метод для инициализации заказа.
    @method execute: Метод для выполнения заказа.
    """

    exceptions = _OrderException

    def __init__(self, obj: OrderT) -> None:
        super().__init__(obj)
        self.order = obj

    async def init_payment(self, request, price: Decimal) -> None:
        from apps.commerce.services.payment_registry import PaymentSystemRegistry
        available = PaymentSystemRegistry.available_systems(self.order.currency)
        if self.order.payment_system not in available:
            raise PaymentBaseService.exceptions.CurrencyNotSupportedForPaymentSystem()

        from apps.commerce.providers.base import PaymentBaseProvider
        provider_cls: type[PaymentBaseProvider] = (
            PaymentSystemRegistry.provider_cls(self.order.payment_system)
        )
        commerce_log.info(f'Using {provider_cls} provider')
        payment = await provider_cls.create(order=self.order, request=request, amount=price)
        self.order.payment = payment
        await self.order.asave()

    @property
    async def receipt_price(self) -> Decimal:
        """
        Возвращает финальную сумму заказа.
        """
        product = await self.order.arelated('product')
        product = await product.aget_real_instance()
        price_row = await product.prices.agetorn(currency=self.order.currency)
        if not price_row:
            return Decimal('0')
        price = price_row.amount
        if self.order.promocode:
            price = await self.order.promocode.calc_price_for_order(order=self.order)
        return price

    async def safe_cancel(self, request, reason: str) -> None:
        if not any((self.order.is_inited, self.order.is_executed, self.order.is_paid, self.order.is_cancelled,
                    self.order.is_refunded)):
            await self.cancel(request=request, reason=reason)
        elif self.order.is_cancelled:
            raise self.exceptions.AlreadyCanceled()
        elif self.order.is_paid:
            raise self.exceptions.CannotCancelPaid()
        elif self.order.is_refunded:
            raise self.exceptions.CannotCancelRefunded()
        elif self.order.is_inited and not any((self.order.is_executed, self.order.is_cancelled, self.order.is_paid)):
            await self.cancel(request=request, reason=reason)

    async def init(self, request, init_payment: bool = True) -> None:
        commerce_log.info(f'Start init order {self.order.id}')
        product = await self.order.arelated('product')
        product = await product.aget_real_instance()
        commerce_log.info(f'For product {product.name}')
        price = await self.receipt_price
        commerce_log.info(f'Price: {price}')
        self.order.amount = price
        await self.order.asave()
        await product.service.can_pregive(self.order, raise_exceptions=True)
        commerce_log.info(f'Pregive process product {product.name}')
        await product.service.pregive(self.order)
        if self.order.payment_system and init_payment and price > 0:
            await self.init_payment(request, price)
        self.order.is_inited = True
        await self.order.asave()

    async def sync_with_payment_system(self) -> None:
        """Synchronize payment status using payment provider."""
        from apps.commerce.providers.base import PaymentBaseProvider
        from apps.commerce.services.payment_registry import PaymentSystemRegistry

        if not self.order.payment_id or not self.order.payment_system:
            raise PaymentBaseService.exceptions.PaymentSystemNotFound()

        payment = await self.order.arelated('payment')
        try:
            provider_cls: type[PaymentBaseProvider] = (
                PaymentSystemRegistry.provider_cls(self.order.payment_system)
            )
        except ValueError:
            raise PaymentBaseService.exceptions.PaymentSystemNotFound() from None

        provider = provider_cls(order=self.order, request=None)
        await provider.sync(payment)

        if payment.is_paid and not self.order.is_executed and not self.order.is_refunded:
            await self.execute()

    async def execute(self) -> None:
        """
        Выполнение заказа после оплаты.
        Отвечает за выполнение операций после оплаты заказа. Выдача товара в том или ином виде,
        обновление моделей оплат, отправка уведомлений если нужно и т.д.
        """
        from apps.commerce.models import PromocodeUsage
        if self.order.is_refunded:
            raise _OrderException.CannotExecuteRefunded()
        if self.order.is_executed:
            raise _OrderException.AlreadyExecuted()
        product = await self.order.arelated('product')
        product = await product.aget_real_instance()
        await product.service.postgive(self.order)
        if self.order.promocode_id:
            await PromocodeUsage.objects.acreate(
                user_id=self.order.user_id, promocode_id=self.order.promocode_id,
            )
        self.order.is_executed = True
        await self.order.asave()
        commerce_log.info(f'Order {self.order.id} EXECUTED successfully')

    async def cancel(self, request, reason: str) -> None:
        if getattr(self.order, 'payment_id'):
            await self.cancel_payment()
        product = await self.order.arelated('product')
        await product.service.cancel_given(request=request, order=self.order, reason=reason)
        self.order.is_cancelled = True
        await self.order.asave()

    def check_available_to_init_payment(self) -> None:
        from apps.commerce.models.payment import CurrencyPaymentSystemMapping
        available_payment_systems = CurrencyPaymentSystemMapping.get_payment(self.order.currency)
        if not available_payment_systems:
            tbank_log.info(f'Валюта {self.order.currency} не поддерживается.')
            raise PaymentBaseService.exceptions.CurrencyNotSupported(
                f'Валюта {self.order.currency} не поддерживается.'
            )
        if self.order.payment_system not in available_payment_systems:
            tbank_log.info(
                f'Платежная система {self.order.payment_system} не поддерживается для валюты {self.order.currency}.'
            )
            raise PaymentBaseService.exceptions.CurrencyNotSupportedForPaymentSystem(
                f'Платежная система {self.order.payment_system} не поддерживается для валюты {self.order.currency}.'
            )

    async def cancel_payment(self) -> None:
        """Отменяет только платеж в шлюзе."""
        await self.sync_with_payment_system()
        payment = await self.order.arelated('payment')
        from apps.tbank.models import TBankPayment
        from apps.commerce.models.payment import HandMadePayment
        from apps.cloudpayments.models import CloudPaymentPayment
        if isinstance(payment, TBankPayment):
            if payment.is_paid:
                tbank_log.info(f'TBank Payment {payment.id} cannot cancel paid.')
                raise self.exceptions.CannotCancelPaid()
            else:
                await payment.service.cancel()
        elif isinstance(payment, CloudPaymentPayment):
            await payment.service.cancel()
        elif isinstance(payment, HandMadePayment):
            pass  # Ручная оплата, отмена тоже ручная
        else:
            commerce_log.info(f'Payment system {self.order.payment_system} not found')
            raise PaymentBaseService.exceptions.PaymentSystemNotFound()
