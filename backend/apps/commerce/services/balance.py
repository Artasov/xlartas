from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from apps.commerce.services.order.base import OrderService
from apps.commerce.services.product.base import ProductBaseService

if TYPE_CHECKING:  # pragma: no cover
    from apps.commerce.models import BalanceProductOrder, BalanceProduct
    from adrf.requests import AsyncRequest


class BalanceService:
    @staticmethod
    async def actual_balance_product() -> Optional['BalanceProduct']:
        try:
            return await BalanceProduct.objects.alatest('id')
        except BalanceProduct.DoesNotExist:
            return None


class BalanceProductService(ProductBaseService['BalanceProduct', 'BalanceProductOrder']):
    async def new_order(self, request: 'AsyncRequest') -> 'BalanceProductOrder':
        from apps.commerce.serializers.balance import BalanceProductOrderCreateSerializer
        s = BalanceProductOrderCreateSerializer(data=request.data, context={'request': request})
        await s.ais_valid(raise_exception=True)
        order: 'BalanceProductOrder' = await s.asave()
        await order.service.init(request)
        return order

    async def cancel_given(self, request, order: 'BalanceProductOrder', reason: str):
        pass

    async def can_pregive(self, order: 'BalanceProductOrder', raise_exceptions: bool = False) -> bool:
        return True

    async def pregive(self, order: 'BalanceProductOrder'):
        pass

    async def postgive(self, order: 'BalanceProductOrder'):
        user = await order.arelated('user')
        user.balance = (user.balance or Decimal('0')) + order.requested_amount
        await user.asave()


class BalanceProductOrderService(OrderService['BalanceProductOrder', 'BalanceProduct']):
    @property
    async def receipt_price(self) -> Decimal:
        return self.order.requested_amount
