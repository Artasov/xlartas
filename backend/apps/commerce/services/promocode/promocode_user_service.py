# commerce/services/promocode/promocode_user_service.py
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.core.models import User


class PromocodeUserService:
    async def promocodes(self: 'User'):
        from apps.commerce.models import PromocodeUsage, Promocode
        promocode_ids = await PromocodeUsage.objects.filter(
            user=self
        ).values_list('promocode_id', flat=True)
        return await Promocode.objects.filter(id__in=promocode_ids).all()
