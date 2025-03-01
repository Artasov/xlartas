# software/controllers/software.py
import logging
from datetime import timedelta

from adjango.adecorators import acontroller
from adjango.utils.base import apprint
from adrf.decorators import api_view
from django.utils import timezone
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.software.models import Software, SoftwareLicense
from apps.software.serializers.software import SoftwareSerializer

log = logging.getLogger('global')


@acontroller('List Softwares')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def list_softwares(_):
    return Response(await SoftwareSerializer(
        await Software.objects.aall(), many=True
    ).adata, status=HTTP_200_OK)


@acontroller('Detail Software')
@api_view(['GET'])
@permission_classes([AllowAny])
async def detail_software(_, software_id: int):
    """
    Возвращает детальную информацию о конкретном Software.
    """
    software = await Software.objects.aget(id=software_id)
    if not software:
        return Response({'detail': 'Not found'}, status=404)
    return Response(await SoftwareSerializer(software).adata, status=HTTP_200_OK)


@acontroller('Activate Test Period')
@api_view(['POST'])
@permission_classes([IsAuthenticated])
async def activate_test_period(request, software_id: int):
    software: Software = await Software.objects.agetorn(Software.ApiEx.DoesNotExist, id=software_id)
    # Проверяем, активирован ли тестовый период уже
    license = await SoftwareLicense.objects.filter(
        user=request.user, software=software, is_tested=True
    ).afirst()
    if license: raise SoftwareLicense.ApiEx.TestPeriodAlreadyUsed()
    # Рассчитываем время тестового периода (количество дней из software.test_period_days переводим в часы)
    test_hours = int(software.test_period_days * 24)
    now = timezone.now()
    license_ends_at = now + timedelta(hours=test_hours)
    license_obj = await SoftwareLicense.objects.acreate(
        user=request.user,
        software=software,
        license_ends_at=license_ends_at,
        is_tested=True
    )
    return Response(
        {'detail': 'Тестовый период активирован', 'license_ends_at': license_obj.license_ends_at},
        status=HTTP_200_OK
    )
