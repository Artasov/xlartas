# xlmine/services/donate.py
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.xlmine.models import DonateProduct, DonateOrder


class DonateProductService:
    """
     Логика для «донатного» продукта.
     """

    @staticmethod
    async def new_order(request) -> 'DonateOrder':
        """
        Создание нового заказа на донат (например, через
        отдельный сериалайзер DonateOrderCreateSerializer).
        Но чаще всего можно просто использовать ваш универсальный
        эндпоинт POST /orders/create/, где product=DonateProduct.
        """
        from apps.commerce.serializers.donate import DonateOrderCreateSerializer
        s = DonateOrderCreateSerializer(data=request.data, context={'request': request})
        await s.ais_valid(raise_exception=True)
        order: 'DonateOrder' = await s.asave()
        # Инициализация оплаты
        await order.init(request)
        return order

    async def can_pregive(self: 'DonateProduct', order: 'DonateOrder', raise_exceptions=False) -> bool:
        """
        Проверка, можно ли сейчас «предвыдать» продукт до оплаты.
        Для доната обычно нет необходимости.
        """
        return True

    async def pregive(self: 'DonateProduct', order: 'DonateOrder'):
        """Действия до оплаты (чаще всего нет)."""
        pass

    async def postgive(self: 'DonateProduct', order: 'DonateOrder'):
        """
        Действия после успешной оплаты: начисляем пользователю коины.
        Берём стоимость заказа в рублях (order.receipt_price) и добавляем к user.xlmine.coins
        """
        user = await order.arelated('user')

        # Получаем/создаём запись UserXLMine
        xlmine = await user.arelated('xlmine')
        if not xlmine:
            from apps.xlmine.models.user import UserXLMine
            xlmine = await UserXLMine.objects.acreate(user=user, coins=Decimal('0.00'))

        # Считаем стоимость заказа (финальная сумма, учтя промокод и т.д.)
        order_price = await order.receipt_price
        if not order_price:
            order_price = Decimal('0.00')

        # Начисляем коины
        xlmine.coins = xlmine.coins + order_price
        await xlmine.asave()

    async def cancel_given(self, request, order: 'DonateOrder', reason: str):
        """
        Отмена выдачи. Если хотите «забирать» коины обратно – можно реализовать здесь.
        """
        pass



class DonateOrderService:
    pass