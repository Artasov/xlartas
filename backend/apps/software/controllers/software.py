# software/controllers/software.py
import logging

from adjango.adecorators import acontroller
from adjango.utils.base import apprint
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.software.models import Software
from apps.software.serializers.software import SoftwareSerializer

log = logging.getLogger('global')


@acontroller('List Softwares')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def list_softwares(_):
    await apprint(await SoftwareSerializer(
        await Software.objects.aall(), many=True
    ).adata)
    return Response(await SoftwareSerializer(
        await Software.objects.aall(), many=True
    ).adata, status=HTTP_200_OK)


@acontroller('Detail Software')
@api_view(['GET'])
@permission_classes([AllowAny])
async def detail_software(request, pk: int):
    """
    Возвращает детальную информацию о конкретном Software.
    """
    software = await Software.objects.aget(pk=pk)
    if not software:
        return Response({'detail': 'Not found'}, status=404)
    return Response(await SoftwareSerializer(software).adata, status=HTTP_200_OK)
