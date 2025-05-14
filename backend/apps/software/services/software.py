# software/services/software.py
from datetime import timedelta
from typing import TYPE_CHECKING

from django.utils import timezone

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder, Software


class SoftwareService:
    async def new_order(self: 'Software', request) -> 'SoftwareOrder':
        from apps.software.serializers import SoftwareOrderCreateSerializer
        from apps.software.models import SoftwareOrder
        s = SoftwareOrderCreateSerializer(
            data=request.data, context={'request': request}
        )
        await s.ais_valid(raise_exception=True)
        data = s.validated_data
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
            currency=request.data['currency'],
            payment_system=request.data['payment_system'],
            product=self,
            license_hours=int(data['license_hours']),
            promocode=promocode
        )
        await order.asave()
        await order.init(request)
        return order

    async def can_pregive(  # noqa TODO: разобрать
            self: 'Software', order: 'SoftwareOrder',  # noqa
            raise_exceptions=False  # noqa
    ) -> bool:
        # Например, всегда True, если хотите какую-то проверку — добавьте:
        return True

    async def pregive(self: 'Software', order: 'SoftwareOrder'):
        pass

    async def cancel_given(self, request, order: 'SoftwareOrder', reason: str, ):
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
