# software/controllers/license.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_404_NOT_FOUND

from apps.software.models.software import Software, SoftwareLicense
from apps.software.serializers import SoftwareLicenseSerializer


@acontroller('License current user')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def license_current_user(request, software_id: int):
    software = await Software.objects.agetorn(Software.ApiEx.DoesNotExist, id=software_id)
    license = await SoftwareLicense.objects.agetorn(
        SoftwareLicense.ApiEx.DoesNotExist,
        user=request.user, software=software
    )
    return Response(await SoftwareLicenseSerializer(license).adata, status=HTTP_200_OK)


@acontroller('List user licenses')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def list_user_licenses(request):
    return Response(await SoftwareLicenseSerializer(
        await SoftwareLicense.objects.afilter(
            user=request.user
        ), many=True
    ).adata, status=HTTP_200_OK)
