# software/services/software.py
from datetime import timedelta
from typing import TYPE_CHECKING

from django.utils import timezone

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder, Software


class SoftwareService:
    async def new_order(self: 'Software', request) -> 'SoftwareOrder':
        from apps.software.models import SoftwareOrder
        data = request.data
        license_hours = data.get('license_hours')
        if not license_hours or int(license_hours) < self.min_license_order_hours:
            raise ValueError(f'License hours must be >= {self.min_license_order_hours}')
        promocode = data.get('promocode', None)
        if promocode:
            await promocode.is_applicable_for(
                user=data['user'],
                product=data['product'],
                currency=data['currency'],
                raise_exception=True
            )
        order = SoftwareOrder(
            user=request.user,
            currency=request.data.get('currency'),
            payment_system=request.data.get('payment_system'),
            product=self,
            license_hours=int(license_hours),
        )
        await order.asave()
        await order.init(request)
        return order

    async def can_pregive(self: 'Software', order: 'SoftwareOrder', raise_exceptions=False) -> bool:
        # Например, всегда True, если хотите какую-то проверку — добавьте:
        return True

    async def pregive(self: 'Software', order: 'SoftwareOrder'):
        pass

    async def postgive(self: 'Software', order: 'SoftwareOrder'):
        from apps.software.models import SoftwareLicense
        license_hours = order.license_hours
        software_license, _ = await SoftwareLicense.objects.aget_or_create(
            user_id=order.user_id, software=self
        )
        now = timezone.now()
        add_time = timedelta(hours=license_hours)
        if software_license.license_ends_at and software_license.license_ends_at > now:
            software_license.license_ends_at += add_time
        else:
            software_license.license_ends_at = now + add_time
        await software_license.asave()
