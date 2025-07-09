# filehost/controllers/files.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from rest_framework import status
from django.conf import settings
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
    return Response(await serializer.adata, status=status.HTTP_200_OK)


@acontroller('Get All Files')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_all_files(request) -> Response:
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    offset = (page - 1) * page_size
    files_qs = File.objects.filter(user=request.user).order_by('-created_at')[offset:offset + page_size]
    files = []
    async for f in files_qs:
        files.append(await FileSerializer(f).adata)
    return Response(files, status=status.HTTP_200_OK)


@acontroller('Add File')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def add_file(request) -> Response:
    user = request.user
    file_size = int(request.data.get('size', 0))
    total = 0
    async for f in File.objects.filter(user=user):
        if f.file:
            total += f.file.size
    if total + file_size > settings.STORAGE_LIMIT:
        raise StorageLimitExceeded()
    request.data['user'] = user.id
    serializer = FileSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    file = await serializer.asave()
    return Response(await FileSerializer(file).adata, status=status.HTTP_201_CREATED)


@acontroller('Get Favorite Files')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_favorite_files(request) -> Response:
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    offset = (page - 1) * page_size
    files_qs = File.objects.filter(user=request.user, is_favorite=True).order_by('-created_at')[
               offset:offset + page_size]
    files = []
    async for f in files_qs:
        files.append(await FileSerializer(f).adata)
    return Response(files, status=status.HTTP_200_OK)


@acontroller('Toggle Favorite File')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def toggle_favorite(request) -> Response:
    file_id = request.data.get('file_id')
    if not file_id:
        raise IdWasNotProvided()
    file = await aget_object_or_404(File, id=file_id, user=request.user)
    if 'value' in request.data:
        file.is_favorite = bool(request.data.get('value'))
    else:
        file.is_favorite = not file.is_favorite
    await file.asave()
    return Response(await FileSerializer(file).adata, status=status.HTTP_200_OK)


@acontroller('Get Storage Usage')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_storage_usage(request) -> Response:
    total = 0
    async for f in File.objects.filter(user=request.user):
        if f.file:
            total += f.file.size
    return Response({'used': total, 'limit': settings.STORAGE_LIMIT}, status=status.HTTP_200_OK)
