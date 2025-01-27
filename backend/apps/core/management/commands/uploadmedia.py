# core/management/commands/uploadmedia.py
import os

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django_minio_backend import MinioBackend
from minio import Minio
from minio.error import S3Error


class Command(BaseCommand):
    help = 'Upload media files from dir'

    def add_arguments(self, parser):
        parser.add_argument('media_path', type=str, help='Path to the media folder')

    def handle(self, *args, **kwargs):
        media_path = kwargs['media_path']
        if not os.path.isdir(media_path):
            self.stdout.write(self.style.ERROR(f'{media_path} is not a valid directory'))
            return

        # Убедитесь, что эти значения соответствуют вашей конфигурации
        minio_client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_HTTPS  # Используйте False, если ваш MinIO работает без SSL
        )

        bucket_name = "media"
        default_storage = MinioBackend()

        for root, dirs, files in os.walk(media_path):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                relative_path = os.path.relpath(file_path, media_path)

                with open(file_path, 'rb') as file:
                    django_file = File(file)
                    default_storage.save(relative_path, django_file)
                    self.stdout.write(self.style.SUCCESS(f'Successfully uploaded {relative_path}'))

