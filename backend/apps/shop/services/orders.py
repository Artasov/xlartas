import logging

from asgiref.sync import sync_to_async

from apps.Core.models.user import User
from apps.shop.models import SoftwareSubscriptionOrder
from apps.tinkoff.models import TinkoffDepositOrder

log = logging.getLogger('base')


async def get_all_user_orders(user_id: int) -> list:
    software_subscription_list = await get_user_software_orders(user_id)
    tinkoff_deposit_list = await get_user_tinkoff_deposit_orders(user_id)
    all_orders = software_subscription_list + tinkoff_deposit_list
    all_orders_sorted = sorted(all_orders, key=lambda order: order.created_at)
    all_orders_sorted.reverse()
    return all_orders_sorted


async def get_user_software_orders(user_id: int) -> list:
    return await sync_to_async(list)(
        SoftwareSubscriptionOrder.objects.filter(
            user_id=user_id
        ).order_by('created_at')
    )


async def get_user_tinkoff_deposit_orders(user_id: int) -> list:
    return await sync_to_async(list)(
        TinkoffDepositOrder.objects.filter(
            user_id=user_id
        ).order_by('created_at')
    )


async def execute_tinkoff_deposit_order(order: TinkoffDepositOrder):
    user: User = await sync_to_async(getattr)(order, 'user', None)
    user.balance += order.amount
    order.is_completed = True
    await order.asave()
    await user.asave()
