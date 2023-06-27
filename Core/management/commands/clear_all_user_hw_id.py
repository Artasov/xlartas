from django.core.management.base import BaseCommand
from django.db import transaction

from Core.models import User


class Command(BaseCommand):
    help = 'Set /' / ' in hw_id model field for each User'

    @transaction.atomic
    def handle(self, *args, **options):
        users = User.objects.all()
        for user in users:
            user.hw_id = ''
            user.save()
        print(f'{len(users)} users was updated.')
