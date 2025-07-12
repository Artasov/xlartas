# commerce/controllers/gift_certificate.py
from adjango.adecorators import acontroller
from adjango.aserializers import ASerializer
from adrf.decorators import api_view
from apps.commerce.serializers.gift_certificate import GiftCertificateSerializer
from rest_framework.decorators import permission_classes
from rest_framework.fields import UUIDField
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.commerce.exceptions.product import ProductException
from apps.commerce.models.gift_certificate import GiftCertificate, GiftCertificateOrder


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
async def activate_gift_certificate(request):
    class GiftCertificateApplySerializer(ASerializer):
        key = UUIDField()

    s = GiftCertificateApplySerializer(data=request.data)
    await s.ais_valid(raise_exception=True)
    order = await GiftCertificateOrder.objects.select_related(
        'product'
    ).agetorn(
        GiftCertificate.ApiEx.KeyNotFound,
        key=s.validated_data['key']
    )
    await order.product.activate(request, order, request.user)
    return Response(status=201)
