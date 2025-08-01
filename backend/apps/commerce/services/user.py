# commerce/services/user.py
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Optional

from adjango.querysets.base import AQuerySet
from django.db.models import Sum
from django.utils import timezone

from apps.core.services.user.base import UserBaseService
from utils.log import get_global_logger

log = get_global_logger()

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.commerce.models import Payment


class CommerceUserService(UserBaseService):
    def success_payments(self, currency: str) -> AQuerySet:
        return self.user.payments.filter(is_paid=True, currency=currency)

    async def sum_success_payments_amount(self, currency: str) -> float:
        aggregate_result = await self.user.service.success_payments(
            currency
        ).aaggregate(total=Sum('amount'))
        amount = float(aggregate_result['total'] or 0.0)
        return amount

    async def date_last_success_payment(self, currency: str) -> Optional[datetime]:
        """
        Возвращает дату последнего успешного платежа пользователя в указанной валюте.

        :param currency: Валюта платежа. По умолчанию RUB.
        :return: Дата последнего успешного платежа или None, если платежи отсутствуют.
        """
        return await self.user.service.success_payments(
            currency=currency
        ).order_by(
            '-created_at'
        ).values_list(
            'created_at', flat=True
        ).afirst()

    async def amount_last_success_payment(self, currency: str) -> float:
        last_payment: Optional['Payment'] = await self.user.service.success_payments(
            currency=currency
        ).order_by('-created_at').afirst()
        amount = float(last_payment.amount) if last_payment else 0.0
        return amount

    async def has_payments_last_x_days(self, days: int) -> bool:
        """
        Проверяет, были ли у пользователя оплаченные платежи за последний месяц.

        :return: True, если были оплаты за последний месяц, иначе False.
        """
        return await self.user.payments.filter(
            is_paid=True, created_at__gte=timezone.now() - timedelta(days=days)
        ).aexists()

    @staticmethod
    def without_payments_last_x_days(days: int) -> AQuerySet['User']:
        """
        Возвращает queryset пользователей, у которых есть хотя бы одна успешная оплата,
        но нет ни одной успешной оплаты за последние `days` дней.

        :param days: Количество дней для проверки отсутствия оплат.
        :return: AQuerySet пользователей.
        """
        from apps.core.models import User
        threshold_date = timezone.now() - timedelta(days=days)
        return User.objects.filter(
            payments__is_paid=True  # Пользователи с хотя бы одной успешной оплатой
        ).exclude(
            payments__is_paid=True,
            payments__created_at__gte=threshold_date
            # Исключаем тех, у кого есть оплаты за последние `x` дней
        ).distinct()
