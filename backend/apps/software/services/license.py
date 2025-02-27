# software/services/license.py
from typing import TYPE_CHECKING

from django.utils import timezone

if TYPE_CHECKING:
    from apps.software.models import SoftwareLicense


class SoftwareLicenseService:
    async def is_active(self: 'SoftwareLicense') -> bool:
        if not self.license_ends_at: return False
        return self.license_ends_at > timezone.now()

    @staticmethod
    def calculate_price(hours: int,
                        amount: float,
                        exponent: float,
                        offset: float) -> int:
        """
        Считаем:
            cost(H) = round( amount * (hours ^ exponent) + offset )
        Если exponent < 1, рост цены замедляется при больших hours.
        """
        if hours <= 0:
            return 0
        raw = amount * (hours ** exponent) + offset
        return round(raw)
