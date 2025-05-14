# commerce/queries/order.py
from django.db.models import QuerySet

from apps.commerce.models import Order


def orders_for_user(user_id: int) -> QuerySet[Order]:
    """
    Наиболее часто используемый запрос получения заказов пользователя.
    """
    return Order.objects.filter(user_id=user_id).select_related('payment', 'product')
