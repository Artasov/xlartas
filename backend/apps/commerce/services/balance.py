from decimal import Decimal
from typing import TYPE_CHECKING

from apps.commerce.services.order.base import IOrderService
from apps.commerce.services.product import IProductService

if TYPE_CHECKING:  # pragma: no cover
    from apps.commerce.models import BalanceProductOrder, BalanceProduct
    from adrf.requests import AsyncRequest


class BalanceProductService(IProductService):
    @staticmethod
    async def new_order(request: 'AsyncRequest') -> 'BalanceProductOrder':
        from apps.commerce.serializers.balance import BalanceProductOrderCreateSerializer
        s = BalanceProductOrderCreateSerializer(data=request.data, context={'request': request})
        await s.ais_valid(raise_exception=True)
        order: 'BalanceProductOrder' = await s.asave()
        await order.init(request)
        return order

    async def cancel_given(self, request, order: 'BalanceProductOrder', reason: str):
        pass

    async def can_pregive(self: 'BalanceProduct', order: 'BalanceProductOrder', raise_exceptions=False) -> bool:
        return True

    async def pregive(self: 'BalanceProduct', order: 'BalanceProductOrder'):
        pass

    async def postgive(self: 'BalanceProduct', order: 'BalanceProductOrder'):
        user = await order.arelated('user')
        user.balance = (user.balance or Decimal('0')) + order.requested_amount
        await user.asave()


class BalanceProductOrderService(IOrderService):
    @property
    async def receipt_price(self: 'BalanceProductOrder') -> Decimal:
        return self.requested_amount
