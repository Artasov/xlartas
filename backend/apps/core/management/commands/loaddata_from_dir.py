import os

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Loads data from all files within a specified directory into the corresponding models'

    def add_arguments(self, parser):
        parser.add_argument('directory', type=str, help='Directory from which data files will be loaded')

    def handle(self, *args, **options):
        directory = options['directory']
        if not os.path.exists(directory):
            self.stdout.write(self.style.ERROR(f'Directory {directory} does not exist'))
            return

        for filename in os.listdir(directory):
            if filename.endswith('.json'):
                self.stdout.write(f'Loading data from {filename}')
                try:
                    call_command('loaddata', os.path.join(directory, filename))
                except Exception as e:
                    print(f'{filename} Not Loaded')
                    print(e)
