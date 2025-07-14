# filehost/services/archive.py
import os
import tempfile
import zipfile
from random import randint

from apps.filehost.models import File, Folder


async def add_folder_to_zip(folder, zip_file):
    files = File.objects.filter(folder=folder)
    async for file in files:
        zip_file.write(file.file.path, os.path.join(folder.name, file.name))

    subfolders = Folder.objects.filter(parent=folder)
    async for subfolder in subfolders:
        await add_folder_to_zip(subfolder, zip_file)


async def collect_files(folder, base_path=''):
    files = []
    subfolders = Folder.objects.filter(parent=folder)
    async for subfolder in subfolders:
        files.extend(await collect_files(subfolder, os.path.join(base_path, subfolder.name)))
    folder_files = File.objects.filter(folder=folder)
    async for file in folder_files:
        files.append((file, os.path.join(base_path, file.name)))
    return files


async def create_archive(folders, files, archive_format='zip'):
    temp_dir = tempfile.mkdtemp()
    archive_name = os.path.join(temp_dir, f'archive{randint(1000, 9999)}.{archive_format}')

    with zipfile.ZipFile(archive_name, 'w') as archive:
        for folder in folders:
            folder_files = await collect_files(folder, folder.name)
            for file, arcname in folder_files:
                archive.write(file.file.path, arcname)
        for file in files:
            archive.write(file.file.path, file.name)

    return archive_name, temp_dir
