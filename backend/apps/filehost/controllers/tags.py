from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.Core.async_django import afilter
from apps.Core.exceptions.base import CoreExceptions
from apps.Core.services.base import acontroller, aget_object_or_404
from apps.filehost.exceptions.base import IdWasNotProvided
from apps.filehost.models import File, Tag, Folder, FileTag, FolderTag
from apps.filehost.serializers import ATagSerializer, FileSerializer, AFolderSerializer
from apps.filehost.services.base import get_all_subfolders


@acontroller('Create Tag')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def create_tag(request) -> Response:
    request.data['user'] = request.user.id
    serializer = ATagSerializer(data=request.data)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    tag = await serializer.asave()
    return Response(ATagSerializer(tag).data, status=status.HTTP_201_CREATED)


@acontroller('Delete Tag')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def delete_tag(request) -> Response:
    tag = await aget_object_or_404(Tag, id=request.data['id'], user=request.user)
    await tag.adelete()
    return Response({'status': 'Tag deleted'}, status=status.HTTP_200_OK)


@acontroller('Get User Tags')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_user_tags(request) -> Response:
    return Response(ATagSerializer(await afilter(Tag.objects, user=request.user), many=True).data)


@acontroller('Add Tag to File or Folder')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def add_tag(request) -> Response:
    tag_id = request.data.get('tag_id')
    file_id = request.data.get('file_id')
    folder_id = request.data.get('folder_id')
    if not tag_id or (not file_id and not folder_id):
        raise IdWasNotProvided()
    tag = await aget_object_or_404(Tag, id=tag_id, user=request.user)
    if file_id:
        file = await aget_object_or_404(File, id=file_id, user=request.user)
        await FileTag.objects.acreate(file=file, tag=tag)
    elif folder_id:
        folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
        await FolderTag.objects.acreate(folder=folder, tag=tag)
    return Response(status=status.HTTP_201_CREATED)


@acontroller('Remove Tag from File or Folder')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def remove_tag(request) -> Response:
    tag_id = request.data.get('tag_id')
    file_id = request.data.get('file_id')
    folder_id = request.data.get('folder_id')
    if not tag_id or (not file_id and not folder_id):
        raise IdWasNotProvided()
    tag = await aget_object_or_404(Tag, id=tag_id, user=request.user)
    if file_id:
        file = await aget_object_or_404(File, id=file_id, user=request.user)
        await FileTag.objects.filter(file=file, tag=tag).adelete()
    elif folder_id:
        folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
        await FolderTag.objects.filter(folder=folder, tag=tag).adelete()
    return Response(status=status.HTTP_200_OK)


@acontroller('Update Tag')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def update_tag(request) -> Response:
    tag_id = request.data.get('tag_id')
    if not tag_id:
        raise IdWasNotProvided()
    tag = await aget_object_or_404(Tag, id=tag_id, user=request.user)
    serializer = ATagSerializer(tag, data=request.data, partial=True)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    tag = await serializer.asave()
    return Response(ATagSerializer(tag).data, status=status.HTTP_200_OK)


@acontroller('Delete Tag, Folder, or File')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def delete_item(request) -> Response:
    tag_id = request.data.get('tag_id')
    file_id = request.data.get('file_id')
    folder_id = request.data.get('folder_id')
    if tag_id:
        tag = await aget_object_or_404(Tag, id=tag_id, user=request.user)
        await tag.adelete()
    elif file_id:
        file = await aget_object_or_404(File, id=file_id, user=request.user)
        await file.adelete()
    elif folder_id:
        folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
        await folder.adelete()
    else:
        raise IdWasNotProvided()
    return Response(status=status.HTTP_204_NO_CONTENT)


@acontroller('Get All Tags in Folder and Subfolders')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def get_all_tags_in_folder(request) -> Response:
    folder_id = request.data.get('id')
    if not folder_id:
        raise IdWasNotProvided()
    folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    subfolders = await get_all_subfolders(folder)
    all_folders = [folder] + subfolders
    tags = await Tag.objects.filter(
        Q(file_tags__file__folder__in=all_folders) |
        Q(folder_tags__folder__in=all_folders)
    ).distinct().all()
    serializer = ATagSerializer(tags, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@acontroller('Filter Files and Folders by Tag in Folder')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def filter_by_tag_in_folder(request) -> Response:
    folder_id = request.data.get('id')
    tag_id = request.data.get('tag_id')
    if not folder_id or not tag_id:
        raise IdWasNotProvided()
    folder = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    tag = await aget_object_or_404(Tag, id=tag_id, user=request.user)
    subfolders = await get_all_subfolders(folder)
    all_folders = [folder] + subfolders
    files = await File.objects.filter(folder__in=all_folders, file_tags__tag=tag).all()
    folders = await Folder.objects.filter(id__in=[f.id for f in all_folders], folder_tags__tag=tag).all()
    files_serializer = FileSerializer(files, many=True)
    folders_serializer = AFolderSerializer(folders, many=True)
    return Response({
        'files': files_serializer.data,
        'folders': folders_serializer.data
    }, status=status.HTTP_200_OK)
