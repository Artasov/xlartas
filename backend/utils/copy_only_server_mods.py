import os
import shutil


def copy_mods(source_path: str, client_mods: list) -> None:
    """
    Копирует все .jar файлы из папки source_path в соседнюю папку mods_server,
    исключая моды, имена которых содержат в себе одну из подстрок, перечисленных в client_mods.

    :param source_path: Путь к исходной папке с модами (например, '/path/to/mods')
    :param client_mods: Список подстрок, по которым проверяется имя файла мода для исключения
                        (например, ['mod1', 'mod2'])
    """
    # Определяем родительскую папку для source_path
    parent_dir = os.path.dirname(source_path.rstrip(os.sep))
    # Формируем путь к соседней папке mods_server
    dest_dir = os.path.join(parent_dir, "mods_server")

    shutil.rmtree(dest_dir, ignore_errors=True)
    # Если папка назначения не существует, создаём её
    os.makedirs(dest_dir, exist_ok=True)

    # Проходим по всем файлам в папке source_path
    for filename in os.listdir(source_path):
        # Проверяем, что файл заканчивается на .jar
        if filename.endswith(".jar"):
            # Если ни одна из подстрок из client_mods не содержится в имени файла, копируем его
            if not any(client_mod in filename for client_mod in client_mods):
                src_file = os.path.join(source_path, filename)
                dst_file = os.path.join(dest_dir, filename)
                try:
                    shutil.copy2(src_file, dst_file)
                    # print(f"Скопирован мод: {filename}")
                except Exception as e:
                    print(f"Ошибка при копировании {filename}: {e}")
            else:
                # Если имя файла содержит одну из исключающих подстрок, пропускаем копирование
                print(f"Пропущен мод (client): {filename}")


if __name__ == '__main__':
    # Пример использования:
    # Указываем путь к папке с модами
    mods_folder = r'C:\Users\xl\curseforge\minecraft\Instances\PIZDAREZ\mods'
    # Указываем список модов, которые не нужно копировать
    client_mods = [
        'AmbientSounds',
        'Jade-1.20',
        'jei-1.20.1',
        'jei-1.20.1',
        'journeymap',
        'justzoom_fabric',
        'BadOptimizations',
        'BetterCompatibilityChecker',
        'BetterF3',
        'betterfpsdist',
        'BetterGrassify',
        'BetterCape',
        'blur',
        'bwncr-fabric',
        'Chimes',
        'custom-crosshair',
        'continuity',
        'Controlling',
        'CustomScoreboard',
        'CustomWindowTitle',
        'screenshot',
        'skin-swapper',
        'custom-crosshair',
        'Cull Less Leaves',
        'durabilitytooltip',
        'Emojiful',
        'entityculling',
        'EuphoriaPatcher',
        'fabricskyboxes',
        # 'FallingTree-1.20.1',
        'fast-ip-ping',
        'fastboot',
        'gpumemleakfix',
        'ImmediatelyFast',
        'inventoryhud',
        'ItemPhysicLite',
        'moreculling',
        'skin-swapper',
        'iris',
        'lambdynamiclights',
        'motionblur',
        'MouseTweaks',
        'Prism',
        'SmoothScrollingRefurbished',
        'sodium-extra',
        'sodium-fabric',
        'transparent-fabric',
        'zmedievalmusic',
        'language-reload',
        'light-overlay',
        'hdskins',
        'lithium-fabric',
        'modelfix',
        'smoothswapping',
        'skinlayers3d',
        'show-me',
        'no-resource-pack-warnings',
        'NoChatReports-FABRIC',
        'sound-physics-remastered',
        'spark',
        'WorldEditCUI',
        'waveycapes',
        'reeses_sodium_options',
    ]

    copy_mods(mods_folder, client_mods)
