import logging

from asgiref.sync import sync_to_async

from apps.Core.exceptions.base import SomethingGoWrong
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
    user = await sync_to_async(getattr)(order, 'user', None)
    user.balance += order.amount
    order.is_paid = True
    await order.asave()
    await user.asave()


async def execute_order_by_id(order_id: str):
    """
    Fulfills the order by its id.
    :param order_id: order id str uuid4.
    :return: If it turns out True, otherwise False.
    """
    order = await TinkoffDepositOrder.objects.aget(order_id=order_id)
    if order.is_completed:
        raise SomethingGoWrong()
    await execute_tinkoff_deposit_order(order)
