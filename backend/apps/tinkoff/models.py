from django.db.models import Model

from apps.Core.models.user import User
from apps.shop.models import BaseOrder


class TinkoffDepositOrder(BaseOrder):

    def __str__(self):
        return f"Order #{self.id}"
