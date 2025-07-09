# software/services/order.py
from apps.commerce.services.order.base import OrderService
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder


class SoftwareOrderService(OrderService['SoftwareOrder']):
    pass
