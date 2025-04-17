# your_app/management/commands/healthcheck.py
import sys

from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = 'Проверка доступности сервера и базы данных'

    def handle(self, *args, **options):
        for conn in connections.all():
            try:
                conn.cursor()
            except OperationalError as e:
                self.stderr.write(str(e))
                sys.exit(1)
        self.stdout.write('OK')
        sys.exit(0)
