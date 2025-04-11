# xlmine/services/user.py
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from django.db.models import Sum

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.xlmine.models import Privilege


class UserXLMineService:
    async def privilege(self: 'User') -> Optional['Privilege']:
        """
        Возвращает самую «высокую» привилегию (по threshold),
        доступную пользователю исходя из общего объёма его успешных
        платежей (например, в RUB).
        """
        # Берём первую привилегию с threshold <= total, упорядоченных по убыванию
        return Privilege.objects.get_by_threshold(await self.sum_donate_amount())

    async def sum_donate_amount(self: 'User') -> Decimal:
        return (await self.donate_orders.aaggregate(total=Sum('payment__amount')))['total'] or Decimal(0)

    async def xlmine_uuid(self: 'User') -> str:
        from apps.xlmine.models.user import UserXLMine
        xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=self)
        return xlmine_user.uuid
