# xlmine/services/server/console.py
import traceback

from django.conf import settings
from mcrcon import MCRcon


class RconServerConsole:
    """
    Класс для отправки команд на сервер через RCON.
    Использует настройки из settings: RCON_HOST, RCON_PORT, RCON_PASSWORD.
    """

    def __init__(self):
        self.host = settings.RCON_HOST
        self.port = settings.RCON_PORT
        self.password = settings.RCON_PASSWORD

    def send_command(self, command: str) -> str:
        """
        Отправляет команду на сервер через RCON и возвращает ответ.

        :param command: Команда для выполнения на сервере.
        :return: Ответ сервера или сообщение об ошибке.
        """
        try:
            with MCRcon(self.host, self.password, port=self.port) as mcr:
                response = mcr.command(command)
                return response
        except Exception as e:
            traceback.print_exc()
            return f"Ошибка при выполнении команды: {str(e)}"
