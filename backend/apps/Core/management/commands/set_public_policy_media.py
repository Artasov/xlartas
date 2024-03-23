import os

from django.conf import settings
from django.core.management.base import BaseCommand
from minio import Minio
from minio.error import S3Error


class Command(BaseCommand):
    help = 'Make the media bucket public'

    def handle(self, *args, **kwargs):
        minio_client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_HTTPS
        )
        bucket_name = "media"
        try:
            policy = '''{
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::%s/*"
                }]
            }''' % bucket_name
            minio_client.set_bucket_policy(bucket_name, policy)
            self.stdout.write(self.style.SUCCESS(f'Successfully set {bucket_name} bucket to public'))
        except S3Error as e:
            self.stdout.write(self.style.ERROR(f'Error setting bucket policy: {e}'))
        except Exception as e:
            print('Error setting bucket policy!}')
            print('Error setting bucket policy!}')
            print('Error setting bucket policy!}')
            print(e)
