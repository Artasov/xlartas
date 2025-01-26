import logging

from apps.core.async_django import afilter, arelated
from apps.core.models.user import User
from apps.shop.models import SoftwareSubscriptionOrder
from apps.tinkoff.models import TinkoffDepositOrder

log = logging.getLogger('global')


async def get_orders(*args, **kwargs) -> list:
    """
    Returns a list of all orders from all order models (both deposits and subscriptions).
    You can use this as get_orders(user_id=user_id, is_completed=True).
    :param args, kwargs: Parameters for filtering orders (use BaseOrder fields).
    :return: List of model objects inherited from BaseOrder
    """
    software_subscription_list = await afilter(
        SoftwareSubscriptionOrder.objects.order_by('created_at'),
        *args, **kwargs
    )
    tinkoff_deposit_list = await afilter(
        TinkoffDepositOrder.objects.order_by('created_at'),
        *args, **kwargs
    )
    all_orders = software_subscription_list + tinkoff_deposit_list
    all_orders_sorted = sorted(all_orders, key=lambda order: order.created_at)
    all_orders_sorted.reverse()
    return all_orders_sorted


async def execute_tinkoff_deposit_order(order: TinkoffDepositOrder):
    user: User = await arelated(order, 'user')
    user.balance += order.amount
    order.is_completed = True
    await order.asave()
    await user.asave()
