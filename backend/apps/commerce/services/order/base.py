# commerce/services/order/base.py
import logging
from decimal import Decimal
from typing import TYPE_CHECKING, Union, Generic

from apps.commerce.exceptions.order import OrderException
from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.services.typing import OrderT, ProductT

tbank_log = logging.getLogger('tbank')
commerce_log = logging.getLogger('commerce')

if TYPE_CHECKING:
    from apps.commerce.models import Order, HandMadePayment


class OrderService(Generic[OrderT, ProductT]):
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
    async def init_payment(self: OrderT, request, price: Decimal):
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
        self.payment = payment  # TODO: Instance attribute payment defined outside __init__
        await self.asave()

    @property
    async def receipt_price(self: OrderT):
        """
        Возвращает финальную сумму для чека.
        """
        price_row = await self.product.prices.agetorn(currency=self.currency)
        if not price_row: return Decimal('0')
        price = price_row.amount
        if self.promocode: price = await self.promocode.calc_price_for_order(order=self)
        return price

    async def safe_cancel(self: OrderT, request, reason: str):
        if not any((self.is_inited, self.is_executed, self.is_paid, self.is_cancelled, self.is_refunded)):
            await self.cancel(request=request, reason=reason)
        elif self.is_cancelled:
            raise OrderException.AlreadyCanceled()
        elif self.is_paid:
            raise OrderException.CannotCancelPaid()
        elif self.is_refunded:
            raise OrderException.CannotCancelRefunded()
        elif self.is_inited and not any((self.is_executed, self.is_cancelled, self.is_paid)):
            await self.cancel(request=request, reason=reason)

    async def init(self: OrderT, request, init_payment: bool = True):
        commerce_log.info(f'Start init order {self.id}')
        self.product = await self.arelated('product')
        self.product = await self.product.aget_real_instance()  # TODO: Instance attribute product defined outside __init__ но на самом то деле это поле из модели
        commerce_log.info(f'For product {self.product.name}')
        price = await self.receipt_price
        commerce_log.info(f'Price: {price}')
        self.amount = price  # TODO: тоже самое Instance attribute amount defined outside __init__
        await self.asave()
        await self.product.can_pregive(self, raise_exceptions=True)
        commerce_log.info(f'Pregive process product {self.product.name}')
        await self.product.pregive(self)  # noqa
        if self.payment_system and init_payment and price > 0:
            await self.init_payment(request, price)
        self.is_inited = True  # TODO: Instance attribute is_inited defined outside __init__
        await self.asave()

    async def sync_with_payment_system(self: OrderT):
        """Synchronize payment status using payment provider."""
        from apps.commerce.providers.base import BasePaymentProvider
        from apps.commerce.services.payment_registry import PaymentSystemRegistry

        if not self.payment_id or not self.payment_system:
            raise PaymentException.PaymentSystemNotFound()

        payment = await self.arelated('payment')
        try:
            provider_cls: type[BasePaymentProvider] = (
                PaymentSystemRegistry.provider_cls(self.payment_system)
            )
        except ValueError:
            raise PaymentException.PaymentSystemNotFound() from None

        provider = provider_cls(order=self, request=None)
        await provider.sync(payment)

        if payment.is_paid and not self.is_executed and not self.is_refunded:
            await self.execute()

    async def execute(self: OrderT):
        """
        Выполнение заказа после оплаты.
        Отвечает за выполнение операций после оплаты заказа. Выдача товара в том или ином виде,
        обновление моделей оплат, отправка уведомлений если нужно и т.д.
        """
        from apps.commerce.models import PromocodeUsage
        if self.is_refunded: raise OrderException.CannotExecuteRefunded()
        if self.is_executed: raise OrderException.AlreadyExecuted()
        self.product = await self.arelated('product')
        self.product = await self.product.aget_real_instance()  # TODO: Instance attribute product defined outside __init__
        await self.product.postgive(self)
        if self.promocode_id:  await PromocodeUsage.objects.acreate(
            user_id=self.user_id, promocode_id=self.promocode_id,
        )
        self.is_executed = True  # TODO: Instance attribute is_executed defined outside __init__
        await self.asave()
        commerce_log.info(f'Order {self.id} EXECUTED successfully')

    async def cancel(self: Union['Order', 'OrderService'], request, reason: str):
        if getattr(self, 'payment_id'):
            await self.cancel_payment()
        self.product = await self.arelated('product')  # TODO: Instance attribute product defined outside __init__
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
        self.payment = await self.arelated('payment')
        from apps.tbank.models import TBankPayment
        from apps.commerce.models.payment import HandMadePayment
        from apps.cloudpayments.models import CloudPaymentPayment
        if isinstance(self.payment, TBankPayment):
            payment: TBankPayment = self.payment
            if payment.is_paid:
                tbank_log.info(f'TBank Payment {payment.id} cannot cancel paid.')
                raise OrderException.CannotCancelPaid()
            else:
                await self.payment.cancel()
        elif isinstance(self.payment, CloudPaymentPayment):
            await self.payment.cancel()
        elif isinstance(self.payment, HandMadePayment):
            pass  # Ручная оплата, отмена тоже ручная
        else:
            commerce_log.info(f'Payment system {self.payment_system} not found')
            raise PaymentException.PaymentSystemNotFound()
