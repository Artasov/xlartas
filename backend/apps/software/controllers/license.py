# software/controllers/license.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from django.utils import timezone
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.software.models.software import Software, SoftwareLicense
from apps.software.serializers import SoftwareLicenseSerializer


@acontroller('License user hours by software id')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def get_license_hours(request, software_id: int):
    try:
        software = await Software.objects.aget(pk=software_id)
    except Software.DoesNotExist:
        return Response({'detail': 'Software not found'}, status=404)

    license_obj = await SoftwareLicense.objects.filter(user=request.user, software=software).afirst()
    now = timezone.now()
    hours = 0
    if license_obj and license_obj.license_ends_at and license_obj.license_ends_at > now:
        delta = license_obj.license_ends_at - now
        hours = int(delta.total_seconds() // 3600)
    return Response({'license_hours': hours}, status=HTTP_200_OK)


@acontroller('List user licenses')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def list_user_licenses(request):
    return Response(await SoftwareLicenseSerializer(
        await SoftwareLicense.objects.afilter(
            user=request.user
        ), many=True
    ).adata, status=HTTP_200_OK)
