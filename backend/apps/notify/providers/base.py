# notify/providers/base.py
from abc import ABC, abstractmethod
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from apps.core.models import User


class INotifyProvider(ABC):
    name: str  # Уникальное имя провайдера

    @abstractmethod
    def send(self, recipient: 'User', context: dict[str, Any], notify_type: str) -> None:
        pass
