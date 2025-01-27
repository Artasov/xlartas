# notify/providers/telegram.py

from typing import Any, TYPE_CHECKING

from .base import INotifyProvider

if TYPE_CHECKING:
    from apps.core.models import User


class TelegramProvider(INotifyProvider):
    name = 'telegram'

    def send(
            self,
            recipient: User,
            context: dict[str, Any],
            notify_type: str,
    ) -> None:
        # Реализация отправки сообщения в Telegram
        # Пример:
        # message_text = f"{config['subject']}\n{context.get('message')}"
        # send_telegram_message(recipient.telegram_id, message_text)
        pass  # Пока не реализовано
