# filehost/controllers/files.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.filehost.exceptions.base import IdWasNotProvided, StorageLimitExceeded
from apps.filehost.models import File
from apps.filehost.serializers import (
    FileSerializer
)


@acontroller('Get File By ID')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def get_file_by_id(request) -> Response:
    file_id = request.data.get('id')
    if not file_id:
        raise IdWasNotProvided()
    file = await aget_object_or_404(File, id=file_id, user=request.user)
    serializer = FileSerializer(file)
    return Response(serializer.data, status=status.HTTP_200_OK)


@acontroller('Get All Files')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_all_files(request) -> Response:
    return Response(await FileSerializer(
        await File.objects.afilter(
            user=request.user
        ), many=True
    ).adata, status=status.HTTP_200_OK)


@acontroller('Add File')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def add_file(request) -> Response:
    user = request.user
    file_size = request.data.get('size', 0)
    total_size = await File.objects.filter(user=user).aggregate(total=Sum('size'))['total'] or 0
    if total_size + file_size > 5 * 1024 * 1024 * 1024:
        raise StorageLimitExceeded()
    request.data['user'] = user.id
    serializer = FileSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    file = await serializer.asave()
    return Response(FileSerializer(file).data, status=status.HTTP_201_CREATED)
