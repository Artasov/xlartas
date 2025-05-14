# commerce/factories/order.py
from attr import Factory

from apps.commerce.models import Order


class OrderFactory(Factory):
    model = Order

    @classmethod
    async def acreate(cls, **kwargs):
        return await super().acreate(**kwargs)
