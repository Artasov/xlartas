# commerce/services/payment.py
from abc import abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.commerce.models import Payment


class PaymentBaseService:

    @abstractmethod
    async def cancel(self: 'Payment'):
        pass
