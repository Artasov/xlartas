# commerce/controllers/gift_certificate.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.commerce.exceptions.product import ProductException
from apps.commerce.models.gift_certificate import GiftCertificate
from apps.commerce.serializers.serializers import GiftCertificateSerializer


@acontroller('Gift Certificates list')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_gift_certificates(_request):
    gift_certificates = await GiftCertificate.objects.aall()
    serializer = GiftCertificateSerializer(gift_certificates, many=True)
    return Response(await serializer.adata)


@acontroller('Gift Certificate detail')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def gift_certificate_detail(request, productId):
    gift_certificate = await GiftCertificate.objects.agetorn(
        ProductException.NotFound, id=productId
    )
    serializer = GiftCertificateSerializer(gift_certificate)
    return Response(await serializer.adata)


@acontroller('Apply gift certificate')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def apply_gift_certificate(request):
    # serializer = GiftCertificateApplySerializer(data=request.data, context={'request': request})
    # await serializer.ais_valid(raise_exception=True)
    # gift_certificate_order = serializer.validated_data['gift_certificate_order']
    # redemption_exists = await GiftCertificateUsage.objects.filter(
    #     order=gift_certificate_order,
    #     user=request.user
    # ).aexists()
    # if redemption_exists:
    #     return Response({'detail': 'Gift certificate already redeemed'}, status=HTTP_400_BAD_REQUEST)
    # await GiftCertificateUsage.objects.acreate(
    #     order=gift_certificate_order,
    #     user=request.user
    # )
    # await gift_certificate_order.execute()
    return Response({'detail': 'Gift certificate applied successfully'})
