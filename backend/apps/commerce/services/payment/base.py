# commerce/services/payment/base.py
from __future__ import annotations

import abc
from typing import TYPE_CHECKING, TypeVar, Generic

from apps.commerce.services.payment.exceptions import _PaymentException
from apps.core.services.base import BaseService

if TYPE_CHECKING:
    pass


class PaymentError(Exception):
    """Общая ошибка платёжного сервиса."""


class PaymentAlreadyCanceled(PaymentError):
    ...


P_co = TypeVar('P_co', bound='Payment', covariant=True)


class PaymentBaseService(BaseService, Generic[P_co]):
    """
    Абстрактный класс, который **все** модели‑платежи должны наследовать.

    Контракт одинаков для всех:
        • cancel()  →  None  (или бросает PaymentAlreadyCanceled)
        • actual_status()  → str | None
    """

    exceptions = _PaymentException

    def __init__(self, payment: P_co) -> None:
        self.payment = payment

    @abc.abstractmethod
    async def cancel(self) -> None:
        """Отменяет (или возвращает) платёж."""
        ...

    @staticmethod
    @abc.abstractmethod
    async def actual_status(payment_id: str | int) -> str | None:
        """Запрашивает актуальный статус у шлюза."""
        ...
