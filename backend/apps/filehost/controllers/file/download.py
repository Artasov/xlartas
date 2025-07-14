# filehost/controllers/file/download.py
import logging
import os
import shutil

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from django.http import HttpResponse, FileResponse, HttpResponseNotFound
from django.utils.translation import gettext_lazy as _
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.filehost.models import Folder, File
from apps.filehost.services.archive import create_archive

log = logging.getLogger('global')


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
        return HttpResponseNotFound(_('File not found'))


@acontroller('Download Archive')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def download_archive(request):
    folder_ids = request.data.get('folder_ids', [])
    file_ids = request.data.get('file_ids', [])
    archive_format = request.data.get('archive_format', 'zip')
    user = request.user

    folders = await Folder.objects.afilter(id__in=folder_ids, user=user)
    files = await File.objects.afilter(id__in=file_ids, user=user)

    if not folders and not files:
        return Response({'error': _('No valid files or folders selected')}, status=400)

    temp_dir = None
    try:
        archive_path, temp_dir = await create_archive(folders, files, archive_format)
        with open(archive_path, 'rb') as archive:
            response = HttpResponse(archive.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(archive_path)}"'
    except Exception:
        log.exception('Error while creating archive')
        raise
    finally:
        if temp_dir:
            shutil.rmtree(temp_dir)

    return response
