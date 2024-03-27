from apps.Core.exceptions.base import CoreExceptions
from apps.shop.services.orders import execute_tinkoff_deposit_order
from apps.tinkoff.models import TinkoffDepositOrder


async def execute_tinkoff_deposit_order_by_id(order_id: str):
    """
    Fulfills the order by its id.
    :param order_id: TinkoffDepositOrder object id - str uuid4.
    """
    order = await TinkoffDepositOrder.objects.aget(order_id=order_id)
    if order.is_completed: raise CoreExceptions.SomethingGoWrong()
    await execute_tinkoff_deposit_order(order)
