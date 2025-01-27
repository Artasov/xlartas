# commerce/managers/order.py
from datetime import timedelta

from adjango.managers.polymorphic import APolymorphicManager
from django.conf import settings
from django.utils.timezone import now


class OrderBaseManager(APolymorphicManager):
    async def cancel_expired_orders(self, user):
        expiration_time = now() - timedelta(hours=settings.HOURS_UNPAID_ORDER_EXPIRED)
        async for order in self.filter(
                user=user, created_at__lt=expiration_time,
                is_inited=False, is_executed=False,
                is_paid=False, is_cancelled=False,
                is_refunded=False
        ): await order.safe_cancel()
