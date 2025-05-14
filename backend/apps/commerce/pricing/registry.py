# commerce/pricing/registry.py
"""
Простой реестр стратегий: имя → класс.
Можно расширять в любой точке проекта.
"""

from __future__ import annotations

from typing import Dict, Type

from apps.commerce.pricing.base import PricingStrategy
from apps.commerce.pricing.strategies import DirectPrice, LinearExponent

_registry: Dict[str, Type[PricingStrategy]] = {
    'direct': DirectPrice,
    'linear_exponent': LinearExponent,
}


def register(name: str, cls: Type[PricingStrategy]) -> None:
    _registry[name] = cls


def get(name: str) -> PricingStrategy:
    if name not in _registry:
        raise KeyError(f'Unknown pricing strategy “{name}”')
    return _registry[name]()
