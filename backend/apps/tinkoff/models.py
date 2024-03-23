from django.db.models import Model
from django.forms import CharField

from apps.Core.models.user import User
from apps.shop.models import BaseOrder


class TinkoffDepositOrder(BaseOrder):
    order_id = CharField(max_length=100, unique=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        return f"Order #{self.id}"
