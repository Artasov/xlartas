# filehost/controllers/file/manage.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from asgiref.sync import sync_to_async
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.filehost.exceptions.base import IdWasNotProvided, StorageLimitExceeded
from apps.filehost.models import File, Folder
from apps.filehost.serializers import (
    FileSerializer, FolderSerializer
)
from apps.filehost.services.base import (
    get_tags,
    get_folders,
    get_files,
    get_root_folder,
)
from apps.filehost.utils import parse_pagination


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
    _, page_size, offset = parse_pagination(request)
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
    _, page_size, offset = parse_pagination(request)
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


@acontroller('Get Full File and Folder Tree')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_full_tree(request) -> Response:
    user = request.user
    root_folder, _ = await get_root_folder(user)
    root_folder_data = await sync_to_async(lambda: FolderSerializer(root_folder).data)()
    root_folder_data['tags'] = await get_tags(root_folder)
    tree = [{
        'folder': root_folder_data,
        'subfolders': await get_folders(parent=root_folder),
        'files': await get_files(folder=root_folder)
    }]
    return Response(tree, status=status.HTTP_200_OK)


@acontroller('Bulk Delete Items')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def bulk_delete_items(request) -> Response:
    file_ids = request.data.get('file_ids', [])
    folder_ids = request.data.get('folder_ids', [])

    if not file_ids and not folder_ids:
        return Response({'error': _('No item ids provided')},
                        status=status.HTTP_400_BAD_REQUEST)
    files = File.objects.filter(id__in=file_ids, user=request.user).select_related('user')
    async for file in files:
        if file.user != request.user:
            return Response({'error': _('Permission denied')}, status=status.HTTP_403_FORBIDDEN)
    folders = Folder.objects.filter(id__in=folder_ids, user=request.user).select_related('user')
    async for folder in folders:
        if folder.user != request.user:
            return Response({'error': _('Permission denied')}, status=status.HTTP_403_FORBIDDEN)

    await File.objects.filter(id__in=[file.id for file in files]).adelete()
    await Folder.objects.filter(id__in=[folder.id for folder in folders]).adelete()

    return Response({'status': _('Items deleted successfully')}, status=status.HTTP_204_NO_CONTENT)


@acontroller('Bulk Update Items')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def bulk_update_items(request) -> Response:
    items_data = request.data.get('items_data', {})

    if not items_data:
        return Response({'error': _('No update data provided')}, status=status.HTTP_400_BAD_REQUEST)

    file_ids = [key for key in items_data.keys() if items_data[key].get('type') == 'file']
    folder_ids = [key for key in items_data.keys() if items_data[key].get('type') == 'folder']

    files = await File.objects.filter(id__in=file_ids, user=request.user)
    folders = await Folder.objects.filter(id__in=folder_ids, user=request.user)

    async for file in files:
        update_data = items_data[str(file.id)]
        for key, value in update_data.items():
            if key != 'type':
                setattr(file, key, value)
        await file.asave()

    async for folder in folders:
        update_data = items_data[str(folder.id)]
        for key, value in update_data.items():
            if key != 'type':
                setattr(folder, key, value)
        await folder.asave()

    return Response({'status': _('Items updated successfully')}, status=status.HTTP_200_OK)


@acontroller('Make Public Access')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def make_public_access(request) -> Response:
    file_id = request.data.get('file_id')
    folder_id = request.data.get('folder_id')
    if file_id:
        item = await aget_object_or_404(File, id=file_id, user=request.user)
    elif folder_id:
        item = await aget_object_or_404(Folder, id=folder_id, user=request.user)
    else:
        raise IdWasNotProvided()
    item.is_public = True
    await item.asave()
    return Response({
        'public_link': item.public_link
    }, status=status.HTTP_200_OK)


@acontroller('Move Item')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def move_item(request) -> Response:
    item_id = request.data.get('item_id')
    new_folder_id = request.data.get('new_folder_id')
    if not item_id or not new_folder_id:
        raise IdWasNotProvided()
    new_folder = await aget_object_or_404(Folder, id=new_folder_id, user=request.user)
    try:
        item = await File.objects.aget(id=item_id, user=request.user)
        item.folder = new_folder
    except File.DoesNotExist:
        item = await Folder.objects.aget(id=item_id, user=request.user)
        item.parent = new_folder
    await item.asave()
    return Response(status=status.HTTP_200_OK)


@acontroller('Rename Item')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def rename_item(request) -> Response:
    item_id = request.data.get('item_id')
    new_name = request.data.get('new_name')
    if not item_id or not new_name:
        raise IdWasNotProvided()
    try:
        item = await File.objects.aget(id=item_id, user=request.user)
        item.name = new_name
        await item.asave()
        data = await FileSerializer(item).adata
    except File.DoesNotExist:
        item = await aget_object_or_404(Folder, id=item_id, user=request.user)
        item.name = new_name
        await item.asave()
        data = await FolderSerializer(item).adata
    return Response(data, status=status.HTTP_200_OK)
