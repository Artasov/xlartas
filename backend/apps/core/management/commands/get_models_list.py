# core/management/commands/get_models_list.py
from django.core.management.base import BaseCommand

from utils.common import get_models_list


class Command(BaseCommand):
    help = 'Print all models app.Model'

    def handle(self, *args, **options):
        for m in get_models_list():
            self.stdout.write(self.style.SUCCESS(m))
