# software/services/order.py
from decimal import Decimal
from typing import TYPE_CHECKING

from apps.commerce.services.order.base import OrderService
from apps.software.services.license import SoftwareLicenseService

if TYPE_CHECKING: ...


class SoftwareOrderService(OrderService['SoftwareOrder', 'Software']):
    @property
    async def receipt_price(self) -> Decimal:
        product = await self.order.arelated('product')
        product = await product.aget_real_instance()
        price_row = await product.prices.agetorn(currency=self.order.currency)
        if not price_row:
            return Decimal('0')

        amount = float(price_row.amount)
        exponent = float(price_row.exponent or 1.0)
        offset = float(price_row.offset or 0.0)

        final_cost_int = SoftwareLicenseService.calculate_price(
            hours=self.order.license_hours,
            amount=amount,
            exponent=exponent,
            offset=offset,
        )
        price = Decimal(str(final_cost_int))

        if self.order.promocode:
            price = await self.order.promocode.calc_price_for_order(order=self.order)

        return price
