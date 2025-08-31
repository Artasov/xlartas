# commerce/services/product/base.py
from abc import abstractmethod
from typing import TYPE_CHECKING

from adjango.services.base import ABaseService

from apps.commerce.services.product.exceptions import _ProductException
from apps.commerce.services.typing import ProductT, OrderT

if TYPE_CHECKING:
    pass


class ProductBaseService(ABaseService):
    """Base service for working with product instances."""
    exceptions = _ProductException

    def __init__(self, obj: ProductT) -> None:
        super().__init__(obj)
        self.product = obj

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
