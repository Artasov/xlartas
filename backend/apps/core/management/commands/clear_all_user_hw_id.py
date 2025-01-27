# core/management/commands/clear_all_user_hw_id.py
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models.user import User


class Command(BaseCommand):
    help = 'Set '' in hw_id model field for each User'

    @transaction.atomic
    def handle(self, *args, **options):
        users = User.objects.all()
        users.update(hw_id='')
        print(f'{len(users)} users was updated.')
