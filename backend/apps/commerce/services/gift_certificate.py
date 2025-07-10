# commerce/services/gift_certificate.py
from typing import TYPE_CHECKING

from apps.commerce.services.product import IProductService

if TYPE_CHECKING:
    from apps.commerce.models import GiftCertificate, GiftCertificateOrder


class GiftCertificateService(IProductService['GiftCertificate', 'GiftCertificateOrder']):
    @staticmethod
    async def new_order(
            request
    ) -> 'GiftCertificateOrder':
        pass
        # from apps.serializers.gift_certificate import GiftCertificateOrderCreateSerializer
        # s = GiftCertificateOrderCreateSerializer(
        #     data=request.data, context={'request': request}
        # )
        # await s.ais_valid(raise_exception=True)
        # data = s.validated_data
        # Проверяем применимость промокода
        # promocode = data.get('promocode', None)
        # if promocode:
        #     await promocode.is_applicable_for(
        #         user=data['user'],
        #         product=data['product'],
        #         currency=data['currency'],
        #         raise_exception=True
        #     )
        # order: 'GiftCertificateOrder' = await s.asave()
        # await order.init(request)
        # return order

    async def cancel_given(self, request, order: 'GiftCertificateOrder', reason: str, ):
        pass

    async def can_pregive(self: 'GiftCertificate',
                          order: 'GiftCertificateOrder',
                          raise_exceptions=False) -> bool: pass

    async def pregive(self: 'GiftCertificate', order: 'GiftCertificateOrder'):
        pass

    async def postgive(self: 'GiftCertificate', order: 'GiftCertificateOrder'):
        pass
