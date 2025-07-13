# commerce/services/promocode/base.py
import logging
from decimal import Decimal
from typing import TYPE_CHECKING

from django.utils import timezone

from apps.commerce.services.order.base import OrderT
from apps.commerce.services.promocode.exceptions import _PromocodeException
from apps.core.services.base import BaseService

commerce_log = logging.getLogger('commerce')

if TYPE_CHECKING:
    from apps.commerce.models.promocode import Promocode, PromocodeUsage
    from apps.core.models.user import User
    from apps.commerce.models import Product


class PromocodeService(BaseService):
    exceptions = _PromocodeException

    def __init__(self, promocode: 'Promocode') -> None:
        self.promocode = promocode

    async def is_applicable_for(
            self,
            user: 'User',
            product: 'Product',
            currency: str,
            raise_exception: bool = False
    ) -> bool:
        from apps.commerce.models.promocode import PromocodeUsage
        now = timezone.now()

        # Проверка даты начала
        if self.promocode.start_date and now < self.promocode.start_date:
            if raise_exception:
                raise self.exceptions.ApiEx.NotStarted()
            return False

        # Проверка даты конца
        if self.promocode.end_date and now > self.promocode.end_date:
            if raise_exception:
                raise self.exceptions.ApiEx.Expired()
            return False

        # Получаем скидку для продукта
        discount = await self.promocode.discounts.filter(product=product).afirst()

        # Проверка, если промокод не применим для продукта
        if not discount:
            if raise_exception:
                raise self.exceptions.ApiEx.NotApplicableForProduct()
            return False

        # Проверка, если промокод не применим для валюты
        if discount.currency != currency:
            if raise_exception:
                raise self.exceptions.ApiEx.NotApplicableForCurrency()
            return False

        # Проверка специфичных пользователей (если есть)
        specific_users = discount.specific_users
        if await specific_users.aexists() and not await specific_users.filter(id=user.id).aexists():
            if raise_exception:
                raise self.exceptions.ApiEx.NotApplicableForClient()
            return False

        # Проверка максимального общего числа применений
        if discount.max_usage is not None:
            total_usage = await PromocodeUsage.objects.filter(promocode=self.promocode).acount()
            if total_usage >= discount.max_usage:
                if raise_exception:
                    raise self.exceptions.ApiEx.MaxUsageExceeded()
                return False

        # Проверка максимального числа применений на пользователя
        if discount.max_usage_per_user is not None:
            user_usage = await PromocodeUsage.objects.filter(promocode=self.promocode, user=user).acount()
            if user_usage >= discount.max_usage_per_user:
                if raise_exception:
                    raise self.exceptions.ApiEx.MaxUsagePerClientExceeded()
                return False

        # Проверка интервала между применениями
        if discount.interval_days is not None:
            last_usage = await self.last_usage(user)
            if last_usage:
                delta_days = (now - last_usage.created_at).days
                if delta_days < discount.interval_days:
                    if raise_exception:
                        raise self.exceptions.ApiEx.UsageTooFrequent()
                    return False
        return True

    async def last_usage(self, user: 'User') -> 'PromocodeUsage':
        from apps.commerce.models.promocode import PromocodeUsage
        return await PromocodeUsage.objects.filter(promocode=self.promocode, user=user).order_by('-created_at').afirst()

    async def usage_count(self) -> int:
        from apps.commerce.models.promocode import PromocodeUsage
        return await PromocodeUsage.objects.filter(promocode=self.promocode).acount()

    async def apply(self, order):
        # Логика применения промокода к заказу (создание PromocodeUsage и т.д.)
        # Это можно будет реализовать при фактической оплате.
        pass

    async def calc_price_for_order(self, order: 'OrderT') -> Decimal:
        """
        Рассчитывает итоговую цену для заказа с учётом данного промокода.
        """
        product = order.product

        # Ищем скидку для продукта
        discount = await self.promocode.discounts.filter(product=product).afirst()
        if not discount:
            # Если нет скидки для продукта, возвращаем исходную цену
            return await order.product.aget_price(currency=order.currency)

        original_price = await order.product.aget_price(currency=order.currency)
        if original_price is None:
            # Нет цены или ошибка
            return Decimal('0.00')

        # Применяем скидку в зависимости от типа промокода
        if self.promocode.discount_type == self.promocode.DiscountType.PERCENTAGE:
            # Понимаем amount из discount - это процент?
            # В модели PromocodeProductDiscount: amount - это сумма, но если discount_type = PERCENTAGE,
            # то amount должен интерпретироваться как процент.
            # Предположим amount хранит числовое значение процента (например 10 для 10%)
            final_price = original_price - (original_price * Decimal(discount.amount) / Decimal(100))
        elif self.promocode.discount_type == self.promocode.DiscountType.FIXED_AMOUNT:
            # amount - фиксированная скидка
            final_price = original_price - Decimal(discount.amount)
            if final_price < Decimal('0.00'):
                final_price = Decimal('0.00')
        else:
            # Неизвестный тип скидки
            final_price = original_price

        return final_price
