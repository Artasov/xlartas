# shop/controllers/orders.py
from typing import TypedDict

from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.models.user import User
from adjango.adecorators import acontroller
from apps.shop.services.orders import get_orders


class Order(TypedDict):
    type: str
    amount: float
    is_completed: bool
    created_at_timestamp: int


@acontroller('Get software data by name')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def current_user_orders(request) -> Response:
    user: User = request.user
    user_orders = await get_orders(user_id=user.id)
    orders = []
    for order in user_orders:
        orders.append(
            Order(
                type=order.type,
                amount=order.amount,
                is_completed=order.is_completed,
                created_at_timestamp=order.created_at.timestamp()
            ))
    return Response({'orders': orders})
