# xlmine/services/donate.py
from decimal import Decimal
from typing import TYPE_CHECKING

from django.db.models import Sum

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.xlmine.models import Donate, DonateOrder


class UserDonateService:

    async def sum_donate_amount(self: 'User') -> Decimal:
        return (await self.donate_orders.aaggregate(total=Sum('payment__amount')))['total'] or Decimal(0)


class DonateService:
    """
     Логика для «донатного» продукта.
     """

    @staticmethod
    async def new_order(request) -> 'DonateOrder':
        """
        Создание нового заказа на донат (например, через
        отдельный сериалайзер DonateOrderCreateSerializer).
        Но чаще всего можно просто использовать ваш универсальный
        эндпоинт POST /orders/create/, где product=Donate.
        """
        from apps.xlmine.serializers.donate import DonateOrderCreateSerializer
        s = DonateOrderCreateSerializer(data=request.data, context={'request': request})
        await s.ais_valid(raise_exception=True)
        order: 'DonateOrder' = await s.asave()
        # Инициализация оплаты
        await order.init(request)
        return order

    async def can_pregive(
            self: 'Donate', order: 'DonateOrder',
            raise_exceptions: bool = False
    ) -> bool:
        """Check that donate product can be issued."""
        from rest_framework.exceptions import ValidationError

        if not self.is_available:
            if raise_exceptions:
                raise ValidationError({'detail': 'Product is not available'})
            return False
        return True

    async def pregive(self: 'Donate', order: 'DonateOrder'):
        """Create XLMine user record if needed before payment."""
        from apps.xlmine.models.user import UserXLMine

        await UserXLMine.objects.aget_or_create(user_id=order.user_id)

    async def postgive(self: 'Donate', order: 'DonateOrder'):  # noqa TODO: разобрать
        """
        Действия после успешной оплаты: начисляем пользователю коины.
        Берём стоимость заказа в рублях (order.receipt_price) и добавляем к user.xlmine.coins
        """
        user = await order.arelated('user')

        # Получаем/создаём запись UserXLMine
        from apps.xlmine.models.user import UserXLMine
        xlmine_user = await UserXLMine.objects.aget_or_create(user=user)
        # Считаем стоимость заказа (финальная сумма, учтя промокод и т.д.)
        order_price = await order.receipt_price
        if not order_price:
            order_price = Decimal('0.00')

        # Начисляем коины
        xlmine_user.coins = xlmine_user.coins + order_price
        await xlmine_user.asave()

        # Обновляем привилегию пользователя в соответствии с суммой донатов
        await user.calc_and_set_current_privilege()

    async def cancel_given(self, request, order: 'DonateOrder', reason: str):
        """
        Отмена выдачи. Если хотите «забирать» коины обратно – можно реализовать здесь.
        """
        pass


class DonateOrderService:
    pass
