# filehost/controllers/file/upload.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

from apps.filehost.exceptions.base import StorageLimitExceeded
from apps.filehost.models import Folder, File
from apps.filehost.serializers import FileSerializer
from apps.filehost.services.base import get_root_folder


@acontroller('Upload Files')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def upload_files(request) -> Response:
    parent_id = request.data.get('parent_id', None)
    files = request.FILES.getlist('files')
    if parent_id:
        parent = await Folder.objects.aget(id=parent_id, user=request.user)
    else:
        parent, _ = await get_root_folder(request.user)

    total = 0
    async for f in File.objects.filter(user=request.user):
        if f.file:
            total += f.file.size
    incoming = sum(f.size for f in files)
    if total + incoming > settings.STORAGE_LIMIT:
        raise StorageLimitExceeded()
    uploaded_files = []
    for file in files:
        uploaded_file = await File.objects.acreate(
            file=file, folder=parent, user=request.user
        )
        uploaded_files.append(await FileSerializer(uploaded_file).adata)

    return Response(uploaded_files, status=status.HTTP_201_CREATED)
