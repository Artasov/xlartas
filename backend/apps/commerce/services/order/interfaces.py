# commerce/services/order/interfaces.py
from decimal import Decimal
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:  # pragma: no cover
    from apps.commerce.models import Order


class Initializable(Protocol):
    async def init(self: 'Order', request, init_payment: bool = True) -> None: ...


class Executable(Protocol):
    async def execute(self: 'Order') -> None: ...


class Cancelable(Protocol):
    async def cancel(self: 'Order', request, reason: str) -> None: ...


class Synchronizable(Protocol):
    async def sync_with_payment_system(self: 'Order') -> None: ...


class Priced(Protocol):
    async def receipt_price(self: 'Order') -> Decimal: ...


class PaymentInitializable(Protocol):
    async def init_payment(self: 'Order', request, primary_price_for_init: Decimal) -> None: ...
