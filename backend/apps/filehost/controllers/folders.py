from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.Core.async_django import aall
from apps.Core.services.base import acontroller, aget_object_or_404
from apps.filehost.exceptions.base import IdWasNotProvided
from apps.filehost.models import Folder, File
from apps.filehost.serializers import AFolderSerializer, FileSerializer


@acontroller('Get Folder By ID')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def get_folder_by_id(request) -> Response:
    folder_id = request.data.get('id')
    if not folder_id: raise IdWasNotProvided()
    folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    serializer = AFolderSerializer(folder)
    return Response(serializer.data, status=status.HTTP_200_OK)


@acontroller('Get All Folders')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_all_folders(request) -> Response:
    folders = await aall(Folder.objects.filter(user=request.user))
    serializer = AFolderSerializer(folders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@acontroller('Get Folder Content')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def get_folder_content(request) -> Response:
    folder_id = request.data.get('id')
    if not folder_id:
        raise IdWasNotProvided()
    folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    subfolders = await aall(Folder.objects.filter(parent=folder))
    files = await aall(File.objects.filter(folder=folder))
    subfolders_serializer = AFolderSerializer(subfolders, many=True)
    files_serializer = FileSerializer(files, many=True)
    return Response({
        'folders': subfolders_serializer.data,
        'files': files_serializer.data
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
        parent = await aget_object_or_404(Folder, name='root', user=request.user)
    folder = await Folder.objects.acreate(name=name, parent=parent, user=request.user)

    return Response(
        await sync_to_async(lambda: AFolderSerializer(folder).data)(),
        status=status.HTTP_201_CREATED
    )
