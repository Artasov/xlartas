# commerce/pricing/strategies.py
from decimal import Decimal, ROUND_HALF_UP

from apps.commerce.pricing.base import PriceContext, PricingStrategy


class DirectPrice(PricingStrategy):
    """
    Стратегия «прямой цены» — просто возвращает ctx["amount"].
    """

    def calculate(self, ctx: PriceContext) -> Decimal:
        return Decimal(ctx['amount']).quantize(Decimal('0.01'))


class LinearExponent(PricingStrategy):
    """
    cost(H) = round( amount * (H ^ exponent) + offset )
    Ожидает ключи: amount, hours, exponent, offset
    """

    def calculate(self, ctx: PriceContext) -> Decimal:
        hours = int(ctx.get('hours', 0))
        if hours <= 0:
            return Decimal('0')
        raw = (
                Decimal(str(ctx['amount'])) *
                (Decimal(hours) ** Decimal(str(ctx.get('exponent', 1))))
                + Decimal(str(ctx.get('offset', 0)))
        )
        return raw.quantize(Decimal('1'), rounding=ROUND_HALF_UP)
