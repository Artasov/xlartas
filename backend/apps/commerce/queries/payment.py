# commerce/queries/payment.py
from django.db.models import QuerySet

from apps.commerce.models.payment import Payment


def unpaid_for_user(user_id: int) -> QuerySet[Payment]:
    return Payment.objects.filter(is_paid=False, user_id=user_id)
