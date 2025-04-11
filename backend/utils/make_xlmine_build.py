import os
import shutil
import zipfile

# Полный путь к исходной папке клиента.
source_dir = r"C:\Users\xl\AppData\Roaming\xlartas-launcher\xlartas-client"

# Путь к родительской директории, где будут искаться/создаваться папки.
parent_dir = os.path.dirname(source_dir)

# Путь к папке релиза.
release_dir = os.path.join(parent_dir, "xlartas-client-release")

# Если папка релиза уже существует — удаляем её, чтобы собрать свежий релиз.
if os.path.exists(release_dir):
    shutil.rmtree(release_dir)

os.makedirs(release_dir, exist_ok=True)

# Список файлов, которые нужно скопировать
files_to_copy = [
    "version.txt",  # файл с версией
    "servers.dat",
    "options.txt",
    "authlib-injector-1.2.5.jar"
]

for file_name in files_to_copy:
    source_file = os.path.join(source_dir, file_name)
    dest_file = os.path.join(release_dir, file_name)
    if os.path.exists(source_file):
        shutil.copy2(source_file, dest_file)
        print(f"Скопирован файл: {file_name}")
    else:
        print(f"Файл {file_name} не найден в {source_dir}")

# Список директорий, которые нужно скопировать
dirs_to_copy = [
    "assets",
    "versions",
    "resourcepacks",
    "shaderpacks",
    "mods",
    "libraries"
]

for dir_name in dirs_to_copy:
    source_path = os.path.join(source_dir, dir_name)
    dest_path = os.path.join(release_dir, dir_name)
    if os.path.exists(source_path):
        shutil.copytree(source_path, dest_path)
        print(f"Скопирована папка: {dir_name}")
    else:
        print(f"Папка {dir_name} не найдена в {source_dir}")

# Создаём zip-архив релиза, помещая файлы и папки на корневой уровень архива.
zip_filename = os.path.join(parent_dir, "xlartas-client-release.zip")
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(release_dir):
        for file in files:
            file_path = os.path.join(root, file)
            # Получаем относительный путь от release_dir, чтобы в архиве не было вложенной папки xlartas-client-release
            arcname = os.path.relpath(file_path, release_dir)
            zipf.write(file_path, arcname)
            print(f"Добавлен в архив: {arcname}")

# Удаляем временную папку релиза
shutil.rmtree(release_dir, ignore_errors=True)
print(f"\nАрхив успешно создан: {zip_filename}")
