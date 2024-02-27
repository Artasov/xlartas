import os

from django.core.files import File
from django.core.management.base import BaseCommand
from django_minio_backend import MinioBackend  # Убедитесь, что это правильный импорт


class Command(BaseCommand):
    help = 'Uploads media files to the specified MinIO bucket'

    def add_arguments(self, parser):
        parser.add_argument('media_path', type=str, help='Path to the media folder')

    def handle(self, *args, **kwargs):
        media_path = kwargs['media_path']
        if not os.path.isdir(media_path):
            self.stdout.write(self.style.ERROR(f'{media_path} is not a valid directory'))
            return

        # Создайте экземпляр MinioBackend здесь
        default_storage = MinioBackend()

        for root, dirs, files in os.walk(media_path):
            for file_name in files:
                # Полный путь к файлу
                file_path = os.path.join(root, file_name)
                # Путь относительно папки media, который будет использоваться в MinIO
                relative_path = os.path.relpath(file_path, media_path)

                with open(file_path, 'rb') as file:
                    django_file = File(file)
                    # Загружаем файл в MinIO, используя relative_path как путь в бакете
                    default_storage.save(relative_path, django_file)
                    self.stdout.write(self.style.SUCCESS(f'Successfully uploaded {relative_path}'))
