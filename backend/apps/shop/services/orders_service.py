from apps.shop.models import SoftwareSubscriptionOrder


def get_user_orders(user_id: int):
    return SoftwareSubscriptionOrder.objects.filter(user_id=user_id) \
        .order_by('created_at')
