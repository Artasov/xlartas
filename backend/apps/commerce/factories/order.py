# commerce/factories/order.py
from apps.commerce.models import Order
from apps.core.factories.base import Factory


class OrderFactory(Factory):
    model = Order

    @classmethod
    async def acreate(cls, **kwargs):
        return await super().acreate(**kwargs)
