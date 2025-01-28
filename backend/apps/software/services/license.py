from typing import TYPE_CHECKING

from django.utils import timezone

if TYPE_CHECKING:
    from apps.software.models import SoftwareLicense


class SoftwareLicenseService:
    async def is_active(self: 'SoftwareLicense') -> bool:
        if not self.license_ends_at: return False
        return self.license_ends_at > timezone.now()
