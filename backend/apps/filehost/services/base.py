# filehost/services/base.py

from asgiref.sync import sync_to_async

from apps.filehost.models import File, Folder
from apps.filehost.serializers import FileSerializer, FolderSerializer, TagSerializer


async def get_root_folder(user):
    """Return user's root folder, creating it if necessary."""
    return await Folder.objects.aget_or_create(
        name='root', user=user, parent=None
    )


async def get_files(*args, **kwargs):
    """
    This function asynchronously retrieves and serializes files for a given folder.
    :param args: Additional positional arguments for filtering.
    :param kwargs: Additional keyword arguments for filtering.
    :return: List of serialized files with their tags.
    """
    files_list = []
    async for file in File.objects.filter(*args, **kwargs).prefetch_related('tags'):
        file_data = FileSerializer(file).data
        file_data['tags'] = await get_tags(file)
        files_list.append(file_data)
    return files_list


async def get_folders(*args, **kwargs):
    """
    This function asynchronously retrieves and serializes folders and their subfolders and files.
    :param args: Additional positional arguments for filtering.
    :param kwargs: Additional keyword arguments for filtering.
    :return: List of serialized folders with their subfolders and files.
    """
    folders_list = []
    async for folder in Folder.objects.filter(*args, **kwargs).prefetch_related('tags'):
        folder_data = await sync_to_async(lambda: FolderSerializer(folder).data)()
        folder_data['tags'] = await get_tags(folder)
        folders_list.append({
            'folder': folder_data,
            'subfolders': await get_subfolders(folder),
            'files': await get_files(folder=folder)
        })
    return folders_list


async def get_tags(obj, *args, **kwargs):
    """
    This function asynchronously retrieves and serializes tags for a given object.
    :param obj: The object (File or Folder) for which to retrieve tags.
    :param args: Additional positional arguments for filtering.
    :param kwargs: Additional keyword arguments for filtering.
    :return: List of serialized tags.
    """
    tags_list = []
    async for tag in obj.tags.filter(*args, **kwargs):
        tag_data = await sync_to_async(lambda: TagSerializer(tag).data)()
        tags_list.append(tag_data)
    return tags_list


async def get_subfolders(folder):
    """
    This function asynchronously retrieves and serializes subfolders for a given folder.
    :param folder: The parent folder for which to retrieve subfolders.
    :return: List of serialized subfolders with their files and sub-subfolders.
    """
    subfolders = Folder.objects.filter(parent=folder).prefetch_related('tags')
    subfolders_list = []
    async for subfolder in subfolders:
        files = await get_files(folder=subfolder)
        subfolders_list.append({
            'folder': await sync_to_async(lambda: FolderSerializer(subfolder).data)(),
            'subfolders': await get_subfolders(subfolder),
            'files': files
        })
    return subfolders_list


async def get_all_subfolders(folder):
    subfolders = await Folder.objects.afilter(parent=folder)
    all_subfolders = list(subfolders)
    for subfolder in subfolders:
        all_subfolders += await get_all_subfolders(subfolder)
    return all_subfolders
