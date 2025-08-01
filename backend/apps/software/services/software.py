# software/services/software.py
import logging
from datetime import timedelta
from typing import TYPE_CHECKING

from django.utils import timezone

from apps.commerce.services.product.base import ProductBaseService

if TYPE_CHECKING:
    from apps.software.models import SoftwareOrder

logger = logging.getLogger(__name__)


class SoftwareService(ProductBaseService['Software', 'SoftwareOrder']):
    async def new_order(self, request) -> 'SoftwareOrder':
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
            product=self.product,
            license_hours=int(data['license_hours']),
            promocode=promocode
        )
        await order.asave()
        await order.service.init(request)
        return order

    async def can_pregive(
            self,
            order: 'SoftwareOrder',
            raise_exceptions: bool = False
    ) -> bool:
        """Validate that the order can be initialized."""
        from rest_framework.exceptions import ValidationError

        if not self.product.is_available:
            if raise_exceptions:
                raise ValidationError({'detail': 'Product is not available'})
            return False

        if order.license_hours < self.product.min_license_order_hours:
            if raise_exceptions:
                raise ValidationError({
                    'detail': f'License hours must be ≥ {self.product.min_license_order_hours}'
                })
            return False

        price_exists = await self.product.prices.filter(currency=order.currency).aexists()
        if not price_exists:
            if raise_exceptions:
                raise ValidationError({'detail': 'Price for currency not found'})
            return False

        return True

    async def pregive(self, order: 'SoftwareOrder'):
        """Prepare license object before payment."""
        from apps.software.models import SoftwareLicense

        await SoftwareLicense.objects.aget_or_create(
            user_id=order.user_id,
            software=self.product,
        )

    async def cancel_given(self, request, order: 'SoftwareOrder', reason: str, ):
        pass

    async def postgive(self, order: 'SoftwareOrder'):
        from apps.software.models import SoftwareLicense
        license_hours = order.license_hours
        software_license, _ = await SoftwareLicense.objects.aget_or_create(
            user_id=order.user_id, software=self.product
        )
        now = timezone.now()
        add_time = timedelta(hours=license_hours)
        if software_license.license_ends_at and software_license.license_ends_at > now:
            software_license.license_ends_at += add_time
        else:
            software_license.license_ends_at = now + add_time
        await software_license.asave()
