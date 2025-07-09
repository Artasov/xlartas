import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from django.conf import settings

from apps.filehost.controllers.base import upload_files
from apps.filehost.exceptions.base import StorageLimitExceeded
from apps.core.models import User
from apps.filehost.models import File


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_upload_files_respects_limit():
    settings.STORAGE_LIMIT = 10
    user = await User.objects.acreate(username='u1')
    await File.objects.acreate(
        file=SimpleUploadedFile('f1.txt', b'12345'), user=user
    )
    factory = APIRequestFactory()
    upload = SimpleUploadedFile('f2.txt', b'1234567')
    request = factory.post('/filehost/files/upload/', {'files': [upload]}, format='multipart')
    request.user = user
    with pytest.raises(StorageLimitExceeded):
        await upload_files(request)
