# xlmine/managers/privilege.py
from decimal import Decimal
from typing import Optional, TYPE_CHECKING

from adjango.managers.base import AManager

if TYPE_CHECKING: from apps.xlmine.models import Privilege


class PrivilegeManager(AManager):

    @staticmethod
    async def get_by_threshold(threshold: Decimal) -> Optional['Privilege']:
        from apps.xlmine.models import Privilege
        return await Privilege.objects.filter(threshold__lte=threshold).order_by('-threshold').afirst()
