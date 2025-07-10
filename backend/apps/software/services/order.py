# software/services/order.py
from decimal import Decimal
from typing import TYPE_CHECKING

from apps.commerce.services.order.base import OrderService
from apps.software.services.license import SoftwareLicenseService

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder


class SoftwareOrderService(OrderService['SoftwareOrder', 'Software']):
    @property
    async def receipt_price(self: 'SoftwareOrder') -> Decimal:
        price_row = await self.product.prices.agetorn(currency=self.currency)
        if not price_row: return Decimal('0')

        amount = float(price_row.amount)
        exponent = float(price_row.exponent or 1.0)
        offset = float(price_row.offset or 0.0)

        final_cost_int = SoftwareLicenseService.calculate_price(
            hours=self.license_hours,
            amount=amount,
            exponent=exponent,
            offset=offset,
        )
        price = Decimal(str(final_cost_int))

        if self.promocode:
            price = await self.promocode.calc_price_for_order(order=self)

        return price
