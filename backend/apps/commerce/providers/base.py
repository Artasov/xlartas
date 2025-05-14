# commerce/providers/base.py
from __future__ import annotations

import abc
from decimal import Decimal
from typing import TYPE_CHECKING

from adrf.requests import AsyncRequest

if TYPE_CHECKING:  # pragma: no cover
    from apps.commerce.models import Order, Payment


class BasePaymentProvider(abc.ABC):
    """
    Базовый контракт для всех платёжных интеграций.
    """

    system_name: str  # Например 'tbank'

    def __init__(self, *, order: 'Order', request: AsyncRequest) -> None:
        self.order = order
        self.request = request

    # --- Factories --------------------------------------------------- #
    @classmethod
    async def create(cls, *, order: 'Order', request: AsyncRequest,
                     amount: Decimal) -> 'Payment':
        """Создать сущность Payment и инициализировать платёжную сессию."""
        self = cls(order=order, request=request)
        return await self._create(amount)

    # --- Abstract behaviour ----------------------------------------- #
    @abc.abstractmethod
    async def _create(self, amount: Decimal) -> 'Payment': ...

    async def cancel(self, payment: 'Payment') -> None:
        """Опциональная отмена платежа."""
        ...

    async def sync(self, payment: 'Payment') -> None:
        """Опциональная синхронизация статуса."""
        ...
