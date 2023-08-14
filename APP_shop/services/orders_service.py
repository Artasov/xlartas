from django.db.models import QuerySet

from APP_shop.models import Order


def get_user_orders(user_id: int) -> QuerySet[Order]:
    return Order.objects.filter(user_id=user_id) \
        .order_by('date_created')
