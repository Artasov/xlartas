from django.core.management.base import BaseCommand

from apps.Core.models import User


class Command(BaseCommand):
    help = 'Set is_confirmed to True for all users'

    def handle(self, *args, **options):
        users = User.objects.all()
        users.update(is_confirmed=True)

        self.stdout.write(self.style.SUCCESS('Successfully updated is_confirmed for all users.'))
