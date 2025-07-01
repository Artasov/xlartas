# core/management/commands/find_translations_errors.py
import os
import shutil

import polib
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        'Создаёт бэкап текущего django.po, запускает makemessages и compilemessages, '
        'затем выводит строки, которые либо пустые, либо совпадают с msgid.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--locale',
            default='ru',
            help='Указать локаль, по умолчанию ru.'
        )

    def handle(self, *args, **options):
        locale = options['locale']

        # 1. Путь к файлу перевода
        base_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '../../../..')
        )
        po_path = os.path.join(base_dir, 'locale', locale, 'LC_MESSAGES', 'django.po')

        if not os.path.isfile(po_path):
            raise CommandError(
                f'Файл {po_path} не найден. '
                f'Убедитесь, что локаль "{locale}" настроена правильно.'
            )

        # 2. Создаём резервную копию текущего .po (например, django_backup.po)
        backup_po_path = po_path.replace('.po', '_backup.po')
        shutil.copy(po_path, backup_po_path)
        self.stdout.write(
            self.style.SUCCESS(
                f'Резервная копия файла перевода сохранена как: {backup_po_path}'
            )
        )

        # 3. Генерируем новые переводы (makemessages -l ru)
        self.stdout.write('Генерирую новые сообщения (makemessages)...')
        call_command('makemessages', locale=locale)
        self.stdout.write(self.style.SUCCESS('makemessages выполнен.'))

        # 4. Компилируем переводы (compilemessages)
        self.stdout.write('Компилирую сообщения (compilemessages)...')
        call_command('compilemessages', locale=locale)
        self.stdout.write(self.style.SUCCESS('compilemessages выполнен.'))

        # 5. Считываем обновлённый .po-файл
        po_file = polib.pofile(po_path)

        # Ищем «проблемные» строки: либо msgstr пустая, либо совпадает с msgin
        problem_entries = [
            entry
            for entry in po_file
            if entry.msgstr.strip() == "" or entry.msgstr == entry.msgid
        ]

        self.stdout.write("\n=== Найдены строки с некорректным переводом ===")
        if not problem_entries:
            self.stdout.write(self.style.SUCCESS("Нет проблемных строк!"))
        else:
            for entry in problem_entries:
                self.stdout.write(f"\nmsgid:  {entry.msgid}")
                self.stdout.write(f"msgstr: {entry.msgstr if entry.msgstr else '«Пусто»'}")

                if entry.msgctxt:
                    self.stdout.write(f"Context: {entry.msgctxt}")
                if entry.comment:
                    self.stdout.write(f"Comment: {entry.comment}")

            self.stdout.write(
                self.style.WARNING(
                    f"\nВсего проблемных строк: {len(problem_entries)}"
                )
            )
