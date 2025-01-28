from datetime import timedelta
from typing import TYPE_CHECKING

from django.utils import timezone

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder, SoftwareProduct


class SoftwareProductService:
    async def new_order(self: 'SoftwareProduct', request) -> 'SoftwareOrder':
        order = SoftwareOrder(
            user=request.user,
            currency=request.data.get('currency'),
            payment_system=request.data.get('payment_system'),
            product=self,
        )
        await order.asave()
        return order

    @staticmethod
    async def can_pregive() -> bool:
        return True

    async def postgive(self: 'SoftwareProduct', order: 'SoftwareOrder'):
        from apps.software.models import SoftwareLicense
        software_license, _ = await SoftwareLicense.objects.aget_or_create(
            user=order.user, software=self.software
        )
        now = timezone.now()
        add_time = timedelta(hours=self.license_hours)
        if software_license.license_ends_at and software_license.license_ends_at > now:
            software_license.license_ends_at += add_time
        else:
            software_license.license_ends_at = now + add_time
        await software_license.asave()
