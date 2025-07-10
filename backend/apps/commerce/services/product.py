# commerce/services/product.py
from abc import abstractmethod
from typing import TYPE_CHECKING, Generic, TypeVar

if TYPE_CHECKING:
    from apps.commerce.models import Order, Product

OrderT = TypeVar('OrderT', bound='Order')
ProductT = TypeVar('ProductT', bound='Product')

class IProductService(Generic[ProductT, OrderT]):
    """
    Интерфейс-сервис для работы с продуктами, который реализует общие шаги
    для выдачи продуктов. Создания заказа под продукт и т.д. Этот класс должен быть унаследован конкретными
    сервисами продуктов, которые реализуют свою логику для подготовки
    и завершения выдачи продукта.
    """

    @staticmethod
    @abstractmethod
    async def new_order(
            request
    ) -> OrderT:
        pass

    @abstractmethod
    async def cancel_given(self: ProductT, request, order: OrderT, reason: str):
        """Отменяем выдачу товара"""
        pass

    @abstractmethod
    async def can_pregive(self: ProductT, order: OrderT, raise_exceptions=False) -> bool:
        """
        Можем ли мы сделать начальную инициализацию продукта у клиента?
        """
        pass

    @abstractmethod
    async def pregive(self: ProductT, order: OrderT):
        """
        Подготовка к выдаче продукта до завершения оплаты.
        Выполняет все начальные действия перед оплатой.
        """
        pass

    @abstractmethod
    async def postgive(self: ProductT, order: OrderT):
        """
        Завершение выдачи продукта после оплаты.
        Выполняет действия для завершения процесса выдачи.
        """
        pass

    @property
    async def type(self: 'Product'):
        return (await self.arelated('polymorphic_ctype')).model
