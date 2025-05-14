# commerce/pricing/base.py
from __future__ import annotations

import abc
from decimal import Decimal
from typing import Protocol, runtime_checkable


class PriceContext(dict):
    """
    Универсальный контейнер любых данных,
    которые стратегия может использовать для расчёта.
    Просто `dict[str, Any]`, но со статичной аннотацией.
    """


@runtime_checkable
class PricingStrategy(Protocol):
    """
    Контракт стратегии ценообразования.

    • Принимает _контекст_ (любые данные), возвращает Decimal.
    • Не диктует, какие ключи обязаны быть в контексте —
      этим занимается конкретная реализация.
    """

    @abc.abstractmethod
    def calculate(self, ctx: PriceContext) -> Decimal: ...
