import logging

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.software.models import Software, SoftwareProduct
from apps.software.serializers import SoftwareSerializer, SoftwareProductSerializer

log = logging.getLogger('global')


@acontroller('List Softwares')
@api_view(['GET'])
@permission_classes([AllowAny])
async def list_softwares(request):
    """
    Возвращает список Software (программ),
    не сами товары для покупки, а именно карточки программ.
    """
    softwares = []
    async for s in Software.objects.filter(is_active=True):
        softwares.append(await SoftwareSerializer(s).adata)
    return Response(softwares, status=HTTP_200_OK)


@acontroller('Detail Software')
@api_view(['GET'])
@permission_classes([AllowAny])
async def detail_software(request, pk: int):
    """
    Возвращает детальную информацию о конкретном Software
    """
    software = await Software.objects.aget(pk=pk)
    if not software:
        return Response({'detail': 'Not found'}, status=404)
    return Response(await SoftwareSerializer(software).adata, status=HTTP_200_OK)


@acontroller('List Software Products')
@api_view(['GET'])
@permission_classes([AllowAny])
async def list_software_products(request, software_id: int):
    """
    Возвращает список SoftwareProduct (вариантов лицензий)
    для конкретной программы Software
    """
    products = []
    async for p in SoftwareProduct.objects.filter(
            software_id=software_id, is_available=True
    ):
        products.append(await SoftwareProductSerializer(p).adata)
    return Response(products, status=HTTP_200_OK)
