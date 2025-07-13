# commerce/services/gift_certificate.py
import logging
from typing import TYPE_CHECKING

from adjango.exceptions.base import ModelApiBaseException
from adrf.requests import AsyncRequest
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND

from apps.commerce.services.order.base import OrderService
from apps.commerce.services.product import ProductBaseService

if TYPE_CHECKING:
    from apps.commerce.models import GiftCertificate, GiftCertificateOrder
    from apps.core.models import User

commerce_log = logging.getLogger('commerce')


class _GiftCertificateException(ModelApiBaseException):
    class ApiEx(ModelApiBaseException.ApiEx):
        class AlreadyUsed(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Gift certificate is already used')}
            default_code = 'gift_certificate_already_used'

        class KeyNotFound(APIException):
            status_code = HTTP_404_NOT_FOUND
            default_detail = {'message': _('Gift certificate key not found')}
            default_code = 'gift_certificate_key_not_found'


class GiftCertificateOrderService(OrderService):
    pass


class GiftCertificateService(ProductBaseService):
    exceptions = _GiftCertificateException

    async def new_order(self, request: AsyncRequest) -> 'GiftCertificateOrder':
        from apps.commerce.serializers.gift_certificate import GiftCertificateOrderCreateSerializer
        s = GiftCertificateOrderCreateSerializer(
            data=request.data, context={'request': request}
        )
        await s.ais_valid(raise_exception=True)
        data = s.validated_data
        # Проверяем применимость промокода
        promocode = data.get('promocode', None)
        if promocode:
            await promocode.is_applicable_for(
                user=data['user'],
                product=data['product'],
                currency=data['currency'],
                raise_exception=True
            )
        order: 'GiftCertificateOrder' = await s.asave()
        await order.service.init(request)
        return order

    async def cancel_given(
            self,
            request: AsyncRequest,
            order: 'GiftCertificateOrder',
            reason: str,
    ) -> None:
        pass

    async def can_pregive(
            self,
            order: 'GiftCertificateOrder',
            raise_exceptions: bool = False
    ) -> bool:
        pass

    async def pregive(
            self,
            order: 'GiftCertificateOrder',
    ) -> None:
        commerce_log.info(f'Product {self.product.name} pregived order:{order.id}')

    async def postgive(
            self,
            order: 'GiftCertificateOrder',
    ) -> None:
        commerce_log.info(f'Product {self.product.name} postgived order:{order.id}')

    async def activate(
            self: 'GiftCertificate',
            request: AsyncRequest,
            order: 'GiftCertificateOrder',
            for_user: 'User'
    ) -> None:
        from apps.commerce.models.gift_certificate import GiftCertificateUsage
        from apps.commerce.services.order.base import OrderService
        if not order.is_executed:
            raise OrderService.exceptions.NotExecutedYet()
        if await GiftCertificateUsage.objects.filter(
                order=order
        ).aexists(): raise self.exceptions.ApiEx.AlreadyUsed()
        product = await self.product.arelated('product')
        product = await product.aget_real_instance()
        await product.service.pregive(request, order, for_user)
        await product.service.postgive(request, order, for_user)
        await GiftCertificateUsage.objects.acreate(
            order=order, user=for_user
        )
        commerce_log.info(f'GiftCertificate {self} activated for user:{for_user.id}, order:{order.id}')
