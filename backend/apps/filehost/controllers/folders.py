# filehost/controllers/folders.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.filehost.exceptions.base import IdWasNotProvided
from apps.filehost.models import Folder, File
from apps.filehost.serializers import FolderSerializer, FileSerializer


@acontroller('Get Folder By ID')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def get_folder_by_id(request) -> Response:
    folder_id = request.data.get('id')
    if not folder_id: raise IdWasNotProvided()
    folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    serializer = FolderSerializer(folder)
    return Response(await serializer.adata, status=status.HTTP_200_OK)


@acontroller('Get All Folders')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_all_folders(request) -> Response:
    serializer = FolderSerializer(await Folder.objects.afilter(user=request.user), many=True)
    return Response(await serializer.adata, status=status.HTTP_200_OK)


@acontroller('Get Folder Content')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def get_folder_content(request) -> Response:
    folder_id = request.data.get('id')
    if not folder_id:
        folder, _ = await Folder.objects.aget_or_create(
            name='root', user=request.user, parent=None
        )
    else:
        folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    subfolders = await Folder.objects.afilter(parent=folder)
    files = await File.objects.afilter(folder=folder)
    subfolders_serializer = FolderSerializer(subfolders, many=True)
    files_serializer = FileSerializer(files, many=True)
    folder_serializer = FolderSerializer(folder)
    return Response({
        'folder': await folder_serializer.adata,
        'folders': await subfolders_serializer.adata,
        'files': await files_serializer.adata
    }, status=status.HTTP_200_OK)


@acontroller('Add Folder')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def add_folder(request) -> Response:
    name = request.data.get('name')
    parent_id = request.data.get('parent_id', None)

    if not name:
        return Response({'error': 'Folder name is required'}, status=status.HTTP_400_BAD_REQUEST)

    if parent_id:
        parent = await aget_object_or_404(Folder, id=parent_id, user=request.user)
    else:
        parent, _ = await Folder.objects.aget_or_create(name='root', user=request.user, parent=None)
    folder = await Folder.objects.acreate(name=name, parent=parent, user=request.user)

    return Response(
        await FolderSerializer(folder).adata,
        status=status.HTTP_201_CREATED
    )
