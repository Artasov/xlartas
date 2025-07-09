# core/management/commands/insert_new_messages.py
import os
import shutil

import polib
from django.conf import settings
from django.core.management import BaseCommand, CommandError, call_command


# TODO: вынести в библиотеку
class Command(BaseCommand):
    help = (
        "1) Создает резервную копию django.po (если нет).\n"
        "2) Вызывает makemessages с нужными расширениями, игнорами.\n"
        "3) Находит в обновленном django.po новые не переведенные сообщения,\n"
        "   удаляет у них комментарии и дописывает в конец.\n"
        "4) Обновляет резервную копию итоговым содержимым."
    )

    def handle(self, *args, **options):
        # Путь к файлу django.po
        po_file_path = os.path.join(settings.BASE_DIR, "locale", "ru", "LC_MESSAGES", "django.po")
        backup_file_path = po_file_path + ".bak"

        # Проверяем, что django.po существует
        if not os.path.exists(po_file_path):
            raise CommandError(f"Файл {po_file_path} не найден.")

        # Если бэкап отсутствует - создаём
        if not os.path.exists(backup_file_path):
            shutil.copy(po_file_path, backup_file_path)
            self.stdout.write(self.style.SUCCESS(
                f"Резервная копия создана: {backup_file_path}"
            ))

        self.stdout.write("=== Выполняем makemessages... ===")

        # Выполняем makemessages для RU, указываем расширения и игнорируем лишние папки
        # Добавьте или уберите расширения по необходимости
        call_command(
            "makemessages",
            locale=["ru"],
            domain="django",
            extensions=["html", "txt", "py", "js", "jsx", "ts", "tsx"],
            ignore=["venv/*", "node_modules/*", ".git/*", "__pycache__/*"],
            verbosity=1,  # при желании можно поставить 0 для тишины
            no_wrap=True,  # чтобы не переносило строки
            no_location=True  # чтобы не добавляло ссылки на файлы в комментариях
        )

        self.stdout.write("=== makemessages завершён. Проверяем новые сообщения... ===")

        # Теперь django.po уже обновлён самим Django
        try:
            current_po = polib.pofile(po_file_path)
        except Exception as e:
            raise CommandError(f"Ошибка чтения {po_file_path}: {e}")

        try:
            backup_po = polib.pofile(backup_file_path)
        except Exception as e:
            raise CommandError(f"Ошибка чтения резервной копии {backup_file_path}: {e}")

        # Собираем msgid из бэкапа, чтобы понять какие записи новые
        backup_msgids = {entry.msgid for entry in backup_po}

        # Выбираем только те записи, которых нет в бэкапе, и у которых msgstr не заполнен
        new_untranslated_entries = [
            e for e in current_po
            if e.msgid not in backup_msgids and not e.msgstr.strip()
        ]

        if not new_untranslated_entries:
            self.stdout.write("Новых сообщений без перевода не найдено. Работа завершена.")
            return

        # Удаляем новые записи (чтобы потом дописать их в конец) — иначе будут дубликаты
        for entry in new_untranslated_entries:
            current_po.remove(entry)

        # Формируем текст новых записей без комментариев
        # (Никаких строк начинающихся с #)
        def format_entry_without_comments(entry):
            # Экранируем двойные кавычки в msgid
            msgid_escaped = entry.msgid.replace('"', r'\"')
            return f'msgid "{msgid_escaped}"\nmsgstr ""\n\n'

        new_entries_text = "".join(format_entry_without_comments(e) for e in new_untranslated_entries)

        self.stdout.write(f"Найдено новых непереведённых сообщений: {len(new_untranslated_entries)}")

        # Записываем текущее содержимое (без новых записей) + новые записи в конец
        # Обратите внимание, что polib не хранит комментарии вида # , поэтому
        # если в файле были ручные комментарии, они могут быть потеряны. Но
        # раз вы хотите избавиться от всех комментариев для новых, то обычно
        # это не проблема.
        updated_content = current_po.__unicode__().rstrip() + "\n\n" + new_entries_text

        # Сохраняем итоговый django.po
        with open(po_file_path, "w", encoding="utf-8") as f:
            f.write(updated_content)

        # Обновляем резервную копию, чтобы в будущем не считать эти записи «новыми»
        with open(backup_file_path, "w", encoding="utf-8") as f:
            f.write(updated_content)

        self.stdout.write(
            self.style.SUCCESS("Файл django.po обновлён. Резервная копия тоже обновлена.")
        )
