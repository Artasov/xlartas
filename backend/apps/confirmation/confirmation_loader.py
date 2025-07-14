# confirmation/confirmation_loader.py
import importlib
import os
from typing import TYPE_CHECKING

from adjango.utils.common import traceback_str
from django.conf import settings

from utils.log import get_global_logger

if TYPE_CHECKING: from apps.confirmation.services.actions import ConfirmationAction

log = get_global_logger()

confirmation_actions: dict[str, 'ConfirmationAction'] = {}


def load_confirmation_actions():
    global confirmation_actions
    if settings.MAIN_PROCESS: log.info('Importing actions...')
    for app in settings.INSTALLED_APPS:
        try:
            # Получаем путь к папке приложения
            module_path = importlib.import_module(app).__path__[0]
            # Определяем путь к папке confirmations и файлу actions.py
            confirmations_dir = os.path.join(module_path, 'confirmations')
            actions_path = os.path.join(confirmations_dir, 'actions.py')

            # Проверяем, существует ли папка confirmations и файл actions.py внутри нее
            if os.path.isdir(confirmations_dir) and os.path.exists(actions_path):
                # Импортируем actions из actions.py
                module = importlib.import_module(f'{app}.confirmations.actions')
                if hasattr(module, 'actions'):
                    # Объединяем actions в общий словарь и логируем каждый action
                    for action_key, action_value in module.actions.items():
                        confirmation_actions[action_key] = action_value
                        if settings.MAIN_PROCESS:
                            log.info(f'Imported action: {app} : {action_key}')
        except Exception as e:
            # Логируем ошибки импорта для приложений без папки confirmations или файла actions.py
            if settings.MAIN_PROCESS: log.error(f'Error importing actions from {app}:\n{traceback_str(e)}')


# Загружаем все actions при запуске
load_confirmation_actions()
