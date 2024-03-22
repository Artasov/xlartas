import logging

from asgiref.sync import sync_to_async
from django.db.models import QuerySet

from apps.Core.exceptions.base import SomethingGoWrong
from apps.shop.models import SoftwareSubscriptionOrder
from apps.tinkoff.models import TinkoffDepositOrder

log = logging.getLogger('base')


def get_user_orders(user_id: int) -> QuerySet[SoftwareSubscriptionOrder]:
    return SoftwareSubscriptionOrder.objects.filter(
        user_id=user_id
    ).order_by('created_at')


async def execute_tinkoff_deposit_order(order: TinkoffDepositOrder):
    user = await sync_to_async(getattr)(order, 'user', None)
    if order.is_paid:
        raise SomethingGoWrong
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
    log.critical('||||||||||||||||||Executing order||||||||||||||||||')
    await execute_tinkoff_deposit_order(
        await TinkoffDepositOrder.objects.aget(order_id=order_id)
    )
    log.critical('||||||||||||||||||Executing order END||||||||||||||||||')
