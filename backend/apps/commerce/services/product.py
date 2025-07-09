# commerce/services/product.py
from __future__ import annotations

from abc import abstractmethod
from typing import TYPE_CHECKING, Protocol, TypeVar

if TYPE_CHECKING:
    from apps.commerce.models import Order, Product

O = TypeVar('O', bound='Order')


class IProductService(Protocol[O]):
    """
    Интерфейс-сервис для работы с продуктами, который реализует общие шаги
    для выдачи продуктов. Этот класс должен быть унаследован конкретными
    сервисами продуктов, которые реализуют свою логику для подготовки
    и завершения выдачи продукта.
    """

    @staticmethod
    @abstractmethod
    async def new_order(
            request
    ) -> O:
        pass

    @abstractmethod
    async def cancel_given(self, request, order: O, reason: str):
        """Отменяем выдачу товара"""
        pass

    @abstractmethod
    async def can_pregive(self: 'Product', order: O, raise_exceptions=False) -> bool:
        """
        Можем ли мы сделать начальную инициализацию продукта у клиента?
        """
        pass

    @abstractmethod
    async def pregive(self: 'Product', order: O):
        """
        Подготовка к выдаче продукта до завершения оплаты.
        Выполняет все начальные действия перед оплатой.
        """
        pass

    @abstractmethod
    async def postgive(self: 'Product', order: O):
        """
        Завершение выдачи продукта после оплаты.
        Выполняет действия для завершения процесса выдачи.
        """
        pass

    @property
    async def type(self: 'Product'):
        return (await self.arelated('polymorphic_ctype')).model
