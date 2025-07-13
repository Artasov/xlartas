# commerce/services/typing.py
from typing import TypeVar

ProductT = TypeVar('ProductT', bound='Product')
OrderT = TypeVar('OrderT', bound='Order')
