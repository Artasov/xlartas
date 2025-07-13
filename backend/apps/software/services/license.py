# software/services/license.py
from importlib import import_module
from typing import TYPE_CHECKING

from django.utils import timezone

from apps.commerce.pricing.base import PricingStrategy, PriceContext

if TYPE_CHECKING:
    from apps.software.models import SoftwareLicense

_DEFAULT_STRATEGY_PATH = 'apps.commerce.pricing.strategies.LinearExponent'


def _load_strategy() -> PricingStrategy:
    module_name, attr = _DEFAULT_STRATEGY_PATH.rsplit('.', 1)
    module = import_module(module_name)
    cls: type[PricingStrategy] = getattr(module, attr)
    return cls()


_PRICING_STRATEGY = _load_strategy()


class SoftwareLicenseService:
    def __init__(self, license: 'SoftwareLicense'):
        self.license = license

    async def is_active(self) -> bool:
        if not self.license.license_ends_at: return False
        return self.license.license_ends_at > timezone.now()

    @staticmethod
    def calculate_price(hours: int,
                        amount: float,
                        exponent: float,
                        offset: float) -> int:
        """
        Стратегия задаётся в settings.SOFTWARE_PRICING_STRATEGY
        (по умолчанию 'linear_exponent').
        """
        from django.conf import settings
        from apps.commerce.pricing.registry import get as get_strategy
        strategy_name = getattr(
            settings, 'SOFTWARE_PRICING_STRATEGY', 'linear_exponent'
        )
        strategy = get_strategy(strategy_name)
        price = strategy.calculate(PriceContext(
            hours=hours,
            amount=amount,
            exponent=exponent,
            offset=offset,
        ))
        return int(price)
