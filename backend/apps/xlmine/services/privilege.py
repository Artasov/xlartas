# xlmine/services/privilege.py
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.xlmine.models import Privilege


class PrivilegeService:
    def give_to(self: 'Privilege', user: 'User') -> str:
        """
        Выдает донат-привилегию пользователю.

        Выполняется команда:
          /lp user <username> parent add donate
        которая добавляет пользователю (по его username) группу доната.

        :param user: Инстанс модели User.
        :return: Ответ сервера после выполнения команды.
        """
        from apps.xlmine.services.server.console import RconServerConsole
        rcon = RconServerConsole()
        command = f"/lp user {user.username} parent add {self.code_name}"
        response = rcon.send_command(command)
        return response
