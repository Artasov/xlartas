# commerce/services/product.py
from abc import abstractmethod
from typing import TYPE_CHECKING, Generic

from apps.commerce.services.typing import ProductT, OrderT

if TYPE_CHECKING:
    from apps.commerce.models import Product


class ProductBaseService(Generic[ProductT, OrderT]):
    """Base service for working with product instances."""

    def __init__(self, product: ProductT) -> None:
        self.product = product

    @abstractmethod
    async def new_order(self, request) -> OrderT:
        pass

    @abstractmethod
    async def cancel_given(self, request, order: OrderT, reason: str):
        """Отменяем выдачу товара"""
        pass

    @abstractmethod
    async def can_pregive(self, order: OrderT, raise_exceptions: bool = False) -> bool:
        """
        Можем ли мы сделать начальную инициализацию продукта у клиента?
        """
        pass

    @abstractmethod
    async def pregive(self, order: OrderT):
        """
        Подготовка к выдаче продукта до завершения оплаты.
        Выполняет все начальные действия перед оплатой.
        """
        pass

    @abstractmethod
    async def postgive(self, order: OrderT):
        """
        Завершение выдачи продукта после оплаты.
        Выполняет действия для завершения процесса выдачи.
        """
        pass

    @property
    async def type(self) -> str:
        return (await self.product.arelated('polymorphic_ctype')).model
