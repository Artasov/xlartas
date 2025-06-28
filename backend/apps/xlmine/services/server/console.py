# xlmine/services/server/console.py

import logging

from adjango.utils.common import traceback_str
from django.conf import settings
from mcrcon import MCRcon

log = logging.getLogger('global')


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
            if settings.IS_CELERY:
                log.info('Rcon <-- %s', command)
            else:
                log.info('Rcon <-- %s', command)
            try:
                import signal
                signal.signal = lambda *args, **kwargs: None
                with MCRcon(self.host, self.password, port=self.port) as mcr:
                    response = mcr.command(command)
                    log.info('Rcon --> %s', response)
                    return response
            except ValueError:
                # работаем в не‑главном потоке — обходим signal‑timeout
                mcr = MCRcon(self.host, self.password, port=self.port)
                # если есть атрибут socket и timeout
                try:
                    mcr.socket.settimeout(mcr.timeout)
                except Exception:  # noqa
                    pass
                response = mcr.command(command)
                log.info('Rcon --> %s', response)
                try:
                    mcr.disconnect()
                except Exception:  # noqa
                    pass
                return response
        except Exception as e:
            log.error('Ошибка при выполнении команды: %s', traceback_str(e))
            return f'Ошибка при выполнении команды: {str(e)}'
