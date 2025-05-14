# filehost/controllers/base.py
import os
import shutil

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from asgiref.sync import sync_to_async
from django.http import HttpResponse, FileResponse, HttpResponseNotFound
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.filehost.exceptions.base import IdWasNotProvided
from apps.filehost.models import Folder, File
from apps.filehost.serializers import FileSerializer, FolderSerializer
from apps.filehost.services.base import create_archive, get_tags, get_folders, get_files


@acontroller('Download File')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def download_file(request):
    file_id = request.data.get('file_id')
    user = request.user

    try:
        file = await File.objects.aget(id=file_id, user=user)
        response = FileResponse(open(file.file.path, 'rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file.name}"'
        return response
    except File.DoesNotExist:
        return HttpResponseNotFound('File not found')


@acontroller('Download Archive')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def download_archive(request):
    folder_ids = request.data.get('folder_ids', [])
    file_ids = request.data.get('file_ids', [])
    archive_format = request.data.get('archive_format', 'zip')  # Default to zip
    user = request.user

    folders = await Folder.objects.afilter(id__in=folder_ids, user=user)
    files = await File.objects.afilter(id__in=file_ids, user=user)

    if not folders and not files:
        return Response({'error': 'No valid files or folders selected'}, status=status.HTTP_400_BAD_REQUEST)

    temp_dir = None
    try:
        archive_path, temp_dir = await create_archive(folders, files, archive_format)

        with open(archive_path, 'rb') as archive:
            response = HttpResponse(archive.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(archive_path)}"'
    except Exception as e:
        raise e
        # return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        if temp_dir:
            shutil.rmtree(temp_dir)

    return response


async def add_folder_to_zip(folder, zip_file):
    files = File.objects.filter(folder=folder)
    async for file in files:
        zip_file.write(file.file.path, os.path.join(folder.name, file.name))

    subfolders = Folder.objects.filter(parent=folder)
    async for subfolder in subfolders:
        await add_folder_to_zip(subfolder, zip_file)


@acontroller('Get Full File and Folder Tree')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_full_tree(request) -> Response:
    user = request.user
    root_folder, _ = await Folder.objects.aget_or_create(user=user, parent=None)
    root_folder_data = await sync_to_async(lambda: FolderSerializer(root_folder).data)()
    root_folder_data['tags'] = await get_tags(root_folder)
    tree = [{
        'folder': root_folder_data,
        'subfolders': await get_folders(parent=root_folder),
        'files': await get_files(folder=root_folder)
    }]
    return Response(tree, status=status.HTTP_200_OK)


@acontroller('Upload Files')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def upload_files(request) -> Response:
    parent_id = request.data.get('parent_id', None)
    files = request.FILES.getlist('files')
    if parent_id:
        parent = await Folder.objects.aget(id=parent_id, user=request.user)
    else:
        parent = await Folder.objects.aget(name='root', user=request.user)
    uploaded_files = []
    for file in files:
        uploaded_file = await File.objects.acreate(
            file=file, folder=parent, user=request.user
        )
        uploaded_files.append(FileSerializer(uploaded_file).data)

    return Response(uploaded_files, status=status.HTTP_201_CREATED)


@acontroller('Bulk Delete Items')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def bulk_delete_items(request) -> Response:
    file_ids = request.data.get('file_ids', [])
    folder_ids = request.data.get('folder_ids', [])

    if not file_ids and not folder_ids:
        return Response({'error': 'No item ids provided'},
                        status=status.HTTP_400_BAD_REQUEST)
    files = File.objects.filter(id__in=file_ids, user=request.user).select_related('user')
    async for file in files:
        if file.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    folders = Folder.objects.filter(id__in=folder_ids, user=request.user).select_related('user')
    async for folder in folders:
        if folder.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    # Удаляем файлы и папки
    await File.objects.filter(id__in=[file.id for file in files]).adelete()
    await Folder.objects.filter(id__in=[folder.id for folder in folders]).adelete()

    return Response({'status': 'Items deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@acontroller('Bulk Update Items')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def bulk_update_items(request) -> Response:
    items_data = request.data.get('items_data', {})

    if not items_data:
        return Response({'error': 'No update data provided'}, status=status.HTTP_400_BAD_REQUEST)

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

    return Response({'status': 'Items updated successfully'}, status=status.HTTP_200_OK)


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
