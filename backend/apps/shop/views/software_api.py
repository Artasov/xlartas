from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.http import FileResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.Core.services.services import aget_object_or_404, acontroller
from apps.shop.models import UserSoftwareSubscription, SoftwareProduct
from apps.shop.services.product import get_softwares
from apps.shop.services.subscription import subscribe_user_software, InsufficientFundsError, activate_test_software_user


@api_view(['GET'])
@permission_classes([AllowAny])
async def software_list(request) -> Response:
    return Response(await get_softwares(is_available=True))


@api_view(['GET'])
@permission_classes([AllowAny])
@acontroller('Get software data by name')
async def software_by_name(request, name) -> Response:
    softwares = await get_softwares(is_available=True, name=name)
    return Response(softwares[0]) if softwares else Response(status=status.HTTP_404_NOT_FOUND)


@acontroller('Apply software subscription by id to current user')
@api_view(('POST',))
@permission_classes([IsAuthenticated])
async def software_test_activate_current_user(request) -> Response:
    software_id = request.data.get('software_id')
    if not software_id:
        return Response(
            data={"error": "Software ID is required."},
            status=status.HTTP_400_BAD_REQUEST)

    await sync_to_async(activate_test_software_user)(
        request.user, software_id=software_id)
    return Response(status=status.HTTP_200_OK)


@acontroller('Apply software subscription by id to current user')
@api_view(('POST',))
@permission_classes([IsAuthenticated])
async def software_subscribe_current_user(request) -> Response:
    sub_id = request.data.get('software_subscription_id')
    if not sub_id:
        return Response(
            data={"error": "Subscription ID is required."},
            status=status.HTTP_400_BAD_REQUEST)
    try:
        await sync_to_async(subscribe_user_software)(
            request.user, subscription_id=sub_id)
        return Response(status=status.HTTP_200_OK)
    except InsufficientFundsError as e:
        return Response({"error": str(e.detail)}, status=e.status_code)
    except Exception as e:
        raise e


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@acontroller('Download software file by id')
async def download_software_file(request, id) -> Response | FileResponse:
    user = request.user
    software = await aget_object_or_404(SoftwareProduct, id=id)
    subscription = await UserSoftwareSubscription.objects.filter(
        user=user, software=software,
        expires_at__gte=timezone.now()
    ).afirst()

    if not subscription:
        return Response({'error': 'No valid license found for this software.'}, status=403)

    file = await sync_to_async(getattr)(software, 'file')
    file_path = file.file.path
    file_extension = file.file.name.split('.')[-1]
    file_name = f"{software.name}.{file_extension}"
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_name)
