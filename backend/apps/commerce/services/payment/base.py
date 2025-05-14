# commerce/services/payment/base.py
from __future__ import annotations

import abc


class PaymentError(Exception):
    """Общая ошибка платёжного сервиса."""


class PaymentAlreadyCanceled(PaymentError):
    ...


class BasePaymentService:
    """
    Абстрактный класс, который **все** модели‑платежи должны наследовать.

    Контракт одинаков для всех:
        • cancel()  →  None  (или бросает PaymentAlreadyCanceled)
        • actual_status()  → str | None
    """

    @abc.abstractmethod
    async def cancel(self) -> None:
        """Отменяет (или возвращает) платёж."""
        ...

    @staticmethod
    @abc.abstractmethod
    async def actual_status(payment_id: str | int) -> str | None:
        """Запрашивает актуальный статус у шлюза."""
        ...
