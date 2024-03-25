import uuid

from django.db.models import Model, CharField

from apps.Core.models.user import User
from apps.shop.models import BaseOrder


class TinkoffDepositOrder(BaseOrder):
    order_id = CharField(max_length=100, default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"Order {self.order_id}"
