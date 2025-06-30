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
        print(1)
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
        print(2)
        order = SoftwareOrder(
            user=request.user,
            currency=request.data['currency'],
            payment_system=request.data['payment_system'],
            product=self,
            license_hours=int(data['license_hours']),
            promocode=promocode
        )
        await order.asave()
        print(3)
        await order.init(request)
        print(8)
        return order

    async def can_pregive(
            self: 'Software', order: 'SoftwareOrder',
            raise_exceptions: bool = False
    ) -> bool:
        """Validate that the order can be initialized."""
        from rest_framework.exceptions import ValidationError

        if not self.is_available:
            if raise_exceptions:
                raise ValidationError({'detail': 'Product is not available'})
            return False

        if order.license_hours < self.min_license_order_hours:
            if raise_exceptions:
                raise ValidationError({
                    'detail': f'License hours must be ≥ {self.min_license_order_hours}'
                })
            return False

        price_exists = await self.prices.filter(currency=order.currency).aexists()  # noqa
        if not price_exists:
            if raise_exceptions:
                raise ValidationError({'detail': 'Price for currency not found'})
            return False

        return True

    async def pregive(self: 'Software', order: 'SoftwareOrder'):
        """Prepare license object before payment."""
        from apps.software.models import SoftwareLicense

        await SoftwareLicense.objects.aget_or_create(
            user_id=order.user_id,
            software=self,
        )

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
