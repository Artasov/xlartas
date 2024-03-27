from adrf.decorators import api_view
from adrf.serializers import Serializer
from django.http import FileResponse
from django.utils import timezone
from rest_framework import status, serializers
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.Core.async_django import arelated
from apps.Core.exceptions.base import CoreExceptions
from apps.Core.services.base import aget_object_or_404, acontroller
from apps.shop.exceptions.base import (
    NoValidLicenseFound, SoftwareFileNotFound, SoftwareByNameNotFound
)
from apps.shop.messages.success import SUCCESS_SOFTWARE_SUBSCRIBE
from apps.shop.models import UserSoftwareSubscription, SoftwareProduct
from apps.shop.services.software import get_softwares
from apps.shop.services.subscription import subscribe_user_software, activate_test_software_user


@acontroller('Get list of software')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def software_list(request) -> Response:
    return Response(await get_softwares(
        SoftwareProduct.objects,
        is_available=True
    ))


@acontroller('Get software data by name')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def software_by_name(request, name) -> Response:
    softwares = await get_softwares(SoftwareProduct.objects, is_available=True, name=name)
    if not softwares: raise SoftwareByNameNotFound()
    return Response(softwares[0])


@acontroller('Apply software subscription by id to current user')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def software_test_activate_current_user(request) -> Response:
    class SoftwareIdSerializer(Serializer):
        software_id = serializers.IntegerField()

    serializer = SoftwareIdSerializer(data=request.data)
    if not serializer.is_valid(): raise CoreExceptions.SomethingGoWrong()

    data = await serializer.adata
    await activate_test_software_user(
        request.user, software_id=data['software_id']
    )
    return Response(status=status.HTTP_200_OK)


@acontroller('Apply software subscription by id to current user')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def software_subscribe_current_user(request) -> Response:
    class SubscriptionIdSerializer(Serializer):
        software_subscription_id = serializers.IntegerField()

    serializer = SubscriptionIdSerializer(data=request.data)
    if not serializer.is_valid(): raise CoreExceptions.SomethingGoWrong()
    data = await serializer.adata
    try:
        await subscribe_user_software(
            request.user,
            subscription_id=data['software_subscription_id']
        )
        return Response(SUCCESS_SOFTWARE_SUBSCRIBE, status=status.HTTP_200_OK)
    except Exception as e:
        raise e


@acontroller('Download software file by id')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def download_software_file(request, id) -> Response | FileResponse:
    user = request.user
    software = await aget_object_or_404(SoftwareProduct, id=id)
    subscription = await UserSoftwareSubscription.objects.filter(
        user=user, software=software,
        expires_at__gte=timezone.now()
    ).afirst()

    if not subscription: raise NoValidLicenseFound()

    file = await arelated(software, 'file')

    if not file: raise SoftwareFileNotFound()

    return Response({'file_url': file.file.url}, status=status.HTTP_200_OK)
