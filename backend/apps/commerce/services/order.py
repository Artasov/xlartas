# commerce/services/order.py
import logging
from decimal import Decimal
from typing import TYPE_CHECKING, Optional, Union

from adjango.utils.base import build_full_url
from adjango.utils.common import traceback_str
from adrf.requests import AsyncRequest
from django.conf import settings
from django.core.handlers.asgi import ASGIRequest
from django.core.handlers.wsgi import WSGIRequest

from apps.commerce.exceptions.order import OrderException
from apps.commerce.exceptions.payment import PaymentException

tbank_log = logging.getLogger('tbank')
commerce_log = logging.getLogger('commerce')

if TYPE_CHECKING:
    from apps.commerce.models import Order, HandMadePayment


class IOrderService:
    """
    Интерфейс-сервис для работы с заказами, частично реализующий функционал.
    Этот класс должен быть унаследован конкретными сервисами заказов,
    которые реализуют свою специфическую логику для создания различных типов заказов.

    @method init: Метод для инициализации заказа.
    @method execute: Метод для выполнения заказа.
    """

    async def init_payment(
            self: 'Order',
            request: AsyncRequest,
            primary_price_for_init: Decimal
    ):
        from apps.commerce.models import PaymentSystem
        from apps.commerce.exceptions.payment import PaymentException

        self.check_available_to_init_payment()

        ### HandMade ###

        if self.payment_system == PaymentSystem.HandMade:
            from apps.commerce.models import HandMadePayment
            from apps.commerce.models import Currency
            tbank_log.info('HandMade Payment init...')
            self.payment = await HandMadePayment.objects.acreate(
                amount=primary_price_for_init,
                currency=Currency.RUB,
                user_id=self.user_id
            )
            await self.asave()

        ### TBank ###

        elif self.payment_system == PaymentSystem.TBank:
            from apps.tbank.classes.TBank import (
                SUCCESS_FAILURE_GET_PARAMS_TEMPLATE,
                ReceiptFFD105, ItemFFD105, AgentData,
                SupplierInfo, Payments, OperationInitiatorType
            )
            from apps.tbank.managers.payment import TBankPaymentManager
            tbank_log.info('TBank Payment init...')
            price_for_init = int(primary_price_for_init * 100)
            quantity = 1
            redirect_url = build_full_url('tbank:notification') + SUCCESS_FAILURE_GET_PARAMS_TEMPLATE

            agent_data = None
            supplier_info = None
            if hasattr(self, 'get_supplier_fallback_name'):
                # есть особый fallback для имени
                fallback = self.get_supplier_fallback_name()
                if fallback:
                    agent_data = AgentData(AgentSign='another')
                    supplier_info = SupplierInfo(
                        Name=fallback,
                        Phones=[settings.PHONE_FOR_RECEIPTS],
                        Inn=settings.BASE_INN_FOR_RECEIPTS
                    )

            items = [ItemFFD105(
                Name=self.product.name,
                Price=price_for_init,
                Quantity=quantity,
                Amount=quantity * price_for_init,
                PaymentMethod='full_payment',
                PaymentObject='service',
                Tax='none',
                AgentData=agent_data,
                SupplierInfo=supplier_info
            )]

            self.payment = await TBankPaymentManager.init(
                user=request.user,
                ip=request.ip,
                amount=price_for_init,
                order_id=self.id,
                receipt=ReceiptFFD105(
                    Items=items,
                    Email=request.user.email,
                    Phone=request.user.phone,
                    Taxation='usn_income',
                    Payments=Payments(Electronic=price_for_init),
                ),
                language='ru',
                operation_initiator_type=OperationInitiatorType.CIT_CNC,
                # Если есть метод get_payment_description – используем его, иначе дефолт
                description=(getattr(self, 'get_payment_description', lambda: 'Оплата заказа')()),
                data={'order_id': self.id},
                notification_url='https://xlartas.ru/tbank/callback/',
                success_url=redirect_url,
                fail_url=redirect_url
            )
            await self.asave()

        ### TBankInstallment ###

        elif self.payment_system == PaymentSystem.TBankInstallment:
            # ----------------------------------
            # Рассрочка Tinkoff Forma
            # ----------------------------------
            from apps.tbank.models import TBankInstallment
            from apps.tbank.classes.TBank import (
                SUCCESS_FAILURE_GET_PARAMS_TEMPLATE,
                ReceiptFFD105, ItemFFD105, AgentData,
                SupplierInfo, Payments, OperationInitiatorType
            )
            from apps.tbank.managers.payment import TBankPaymentManager

            # Преобразуем рубли в копейки
            amount_cents = int(primary_price_for_init * 100)
            # Создаём Payment -> TBankInstallment
            # order_id (UUIDv6) = self.id  (как у TBankPayment)
            installment = TBankInstallment(
                user=request.user,
                currency=self.currency,
                amount=amount_cents,  # Payment.amount (в копейках)
                order_id=self.id,
            )
            await installment.asave()

            # Формируем items
            items = [{
                'name': self.product.name,
                'quantity': 1,
                'price': int(primary_price_for_init),
                'category': 'service',
            }]

            # Опционально — contact_values:
            contact_vals = {}
            if request.user.email:
                contact_vals['email'] = request.user.email
            if getattr(request.user, 'phone', None):
                phone = str(request.user.phone)
                contact_vals['mobilePhone'] = phone
                contact_vals['fio'] = {
                    'firstName': request.user.first_name or '',
                    'lastName': request.user.last_name or '',
                }

            redirect_url = build_full_url('tbank:notification') + SUCCESS_FAILURE_GET_PARAMS_TEMPLATE
            # webhook_url, success_url, fail_url, return_url
            # можно сгенерировать по вашему вкусу
            success_url = f'https://xlartas.ru/orders/installment/'
            fail_url = f'https://xlartas.ru/orders/installment/'
            return_url = f'https://xlartas.ru/orders/installment/'
            webhook_url = 'https://xlartas.ru/tinkoff/cash/callback/'
            try:
                # Вызываем create_installment
                await installment.create_installment(
                    total_sum=int(primary_price_for_init),
                    items=items,
                    webhook_url=webhook_url,
                    success_url=success_url,
                    fail_url=fail_url,
                    return_url=return_url,
                    promo_code='default',
                    contact_values=contact_vals
                )
            except Exception as e:
                log = logging.getLogger('global')
                log.critical(traceback_str(e))
                raise PaymentException.InitError()

            # Привязываем Payment к заказу
            self.payment = installment
            await self.asave()

        else:
            commerce_log.info(f'Payment system {self.payment_system} not found')
            raise PaymentException.PaymentSystemNotFound()

    @property
    async def receipt_price(self: 'Order'):
        """
        Возвращает финальную сумму для чека.
        Для SoftwareOrder учитываем license_hours и хранимые в ProductPrice
        amount + exponent + offset.
        """
        from apps.software.services.license import SoftwareLicenseService
        from apps.software.models import SoftwareOrder
        price_row = await self.product.prices.agetorn(currency=self.currency)
        if not price_row:
            # Если нет строки цены, 0
            return Decimal('0')

        # Вытаскиваем нужные значения
        amount = float(price_row.amount)
        exponent = float(price_row.exponent or 1.0)  # По умолчанию можно 1.0
        offset = float(price_row.offset or 0.0)  # По умолчанию 0.0

        if isinstance(self, SoftwareOrder):
            hours = self.license_hours
            final_cost_int = SoftwareLicenseService.calculate_price(
                hours=hours,
                amount=amount,
                exponent=exponent,
                offset=offset
            )
            price = Decimal(str(final_cost_int))
        else:
            # Для других типов заказа (не SoftwareOrder)
            # просто берём amount (например, * 1 шт.)
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
            await self.cancel(request=request, reason=reason)
        elif self.is_cancelled:
            raise OrderException.AlreadyCanceled()
        elif self.is_paid:
            raise OrderException.CannotCancelPaid()
        elif self.is_refunded:
            raise OrderException.CannotCancelRefunded()
        elif self.is_inited and not any((self.is_executed, self.is_cancelled, self.is_paid)):
            await self.cancel(request=request, reason=reason)

    async def init(self: 'Order', request, init_payment=True) -> None:
        """
        Инициализация заказа перед оплатой и самой оплаты.
        Он отвечает за выполнение начальных шагов, необходимых для обработки заказа,
        таких как проверка данных и подготовка ресурсов.
        """
        if not hasattr(request, 'data'):
            setattr(request, 'data', request.POST)
        self.product = await self.arelated('product')
        self.product = await self.product.aget_real_instance()
        price_for_init = await self.receipt_price
        # Проверяем можем ли сделать pregive
        await self.product.can_pregive(self, raise_exceptions=True)
        # Выполняем pregive по продукту
        await self.product.pregive(self)
        # Если нужно, инициализируем оплату
        print('@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@')
        print(price_for_init)
        if not request.data.get('not_init_payment') and price_for_init > 0 and init_payment and (
                settings.DEBUG and settings.DEBUG_INIT_PAYMENT or not settings.DEBUG
        ): await self.init_payment(request, primary_price_for_init=price_for_init)
        self.is_inited = True
        await self.asave()
        commerce_log.info(f'Order {self.id} INITIATED successfully')
        if price_for_init <= 0:
            commerce_log.info(f'Order {self.id} price < 0 => EXECUTING')
            await self.execute()

    async def sync_with_payment_system(self: 'Order'):
        from apps.tbank.models import TBankPayment
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
                await self.execute()
            tbank_log.info(f'TBank Payment {payment.id} synchronization successfully.')
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
        self.product = await self.product.aget_real_instance()
        await self.product.postgive(self)
        if self.promocode_id:
            await PromocodeUsage.objects.acreate(
                user_id=self.user_id, promocode_id=self.promocode_id,
            )
        self.is_executed = True
        await self.asave()
        commerce_log.info(f'Order {self.id} EXECUTED successfully')

    async def cancel(
            self: Union['Order', 'IOrderService'],
            request: AsyncRequest | WSGIRequest | ASGIRequest,
            reason: str
    ):
        if getattr(self, 'payment_id'):
            await self.cancel_payment()
        self.product = await self.arelated('product')
        await self.product.cancel_given(request=request, order=self, reason=reason)
        self.is_cancelled = True
        await self.asave()

    def check_available_to_init_payment(self: Union['Order', 'IOrderService']):
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

    async def cancel_payment(self: Union['Order', 'IOrderService']):
        """Отменяет только платеж в шлюзе."""
        await self.sync_with_payment_system()
        from apps.tbank.models import TBankPayment
        from apps.commerce.models.payment import HandMadePayment
        if isinstance(self.payment, TBankPayment):
            payment: TBankPayment = await self.arelated('payment')
            if payment.is_paid:
                tbank_log.info(f'TBank Payment {payment.id} cannot cancel paid.')
                raise OrderException.CannotCancelPaid()
            else:
                await self.payment.cancel()
        elif isinstance(self.payment, HandMadePayment):
            pass  # Ручная оплата, отмена тоже ручная
        else:
            commerce_log.info(f'Payment system {self.payment_system} not found')
            raise PaymentException.PaymentSystemNotFound()
