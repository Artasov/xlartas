from django.core.management.base import BaseCommand

from apps.converter.services import (
    load_converter_data_from_file,
    load_default_converter_data,
)


class Command(BaseCommand):
    help = 'Generate converter formats and parameters from JSON configuration file'

    def add_arguments(self, parser):
        parser.add_argument('config', nargs='?', help='Path to JSON config file')
        parser.add_argument(
            '--default', action='store_true', help='Load built-in default formats'
        )

    def handle(self, *args, **options):
        if options['default'] or not options.get('config'):
            load_default_converter_data()
        else:
            load_converter_data_from_file(options['config'])
        self.stdout.write(self.style.SUCCESS('Converter data generated'))
