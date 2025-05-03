# xlmine/services/privilege.py
from pprint import pprint
from typing import TYPE_CHECKING, Optional

from asgiref.sync import async_to_sync

if TYPE_CHECKING:
    from apps.core.models import User
    from apps.xlmine.models import Privilege


class PrivilegeService:
    async def rcon_give_to(self: 'Privilege', user: 'User') -> str:
        """
        Выдает донат-привилегию пользователю.

        Выполняется команда:
          /lp user <username> parent add donate
        которая добавляет пользователю (по его username) группу доната.

        :param user: Инстанс модели User.
        :return: Ответ сервера после выполнения команды.
        """
        from apps.xlmine.services.server.console import RconServerConsole
        from apps.xlmine.models import Privilege
        rcon = RconServerConsole()
        responses: list[str] = []
        for priv in await Privilege.objects.aall():
            if priv.code_name != self.code_name:
                responses.append(await priv.rcon_remove_from(user))
        responses.append(rcon.send_command(f"lp user {user.username} parent add {self.code_name}"))
        return '\n'.join(responses)

    async def rcon_remove_from(self: 'Privilege', user: 'User') -> str:
        from apps.xlmine.services.server.console import RconServerConsole
        rcon = RconServerConsole()
        command = f"lp user {user.username} parent remove {self.code_name}"
        return rcon.send_command(command)

    async def sync_remote(self: 'Privilege') -> list[str]:
        """
        Создаёт или обновляет LuckPerms‑группу для данной привилегии.
        """
        from apps.xlmine.services.server.console import RconServerConsole
        rcon = RconServerConsole()
        commands = [
            f"lp creategroup {self.code_name}",
            f"lp group {self.code_name} setdisplayname \"{self.name}\"",
            f"lp group {self.code_name} parent set default",
            f"lp group {self.code_name} meta setprefix 10 \"{self.prefix}\"",
            f"lp group {self.code_name} setweight {self.weight}",
        ]
        return [rcon.send_command(cmd) for cmd in commands]

    def sync_sync_remote(self):
        return async_to_sync(self.sync_remote)()


class UserPrivilegeService:

    # ──────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────

    async def _next_privilege(self: 'User', up: bool = True) -> Optional['Privilege']:
        from apps.xlmine.models import Privilege
        from apps.xlmine.models.user import UserXLMine
        xlm: UserXLMine = await self.arelated('xlmine_user')
        if getattr(xlm, 'privilege_id') is None:
            await self.calc_and_set_current_privilege()
        current = await xlm.arelated('privilege')
        if up:
            if current:
                qs = Privilege.objects.filter(threshold__gt=current.threshold).order_by('threshold')
            else:
                qs = Privilege.objects.order_by('threshold')
        else:
            if not current: return None
            qs = Privilege.objects.filter(threshold__lt=current.threshold).order_by('-threshold')
        return await qs.afirst()

    # ──────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────
    async def set_privilege(self: 'User', privilege: 'Privilege'):
        await privilege.rcon_give_to(self)

    async def calc_and_set_current_privilege(self: 'User'):
        from apps.xlmine.models import Privilege
        xlm = await self.arelated('xlmine_user')
        xlm.privilege = await Privilege.objects.get_by_threshold(await self.sum_donate_amount())
        await xlm.asave()

    async def upgrade_privilege(self: 'User') -> Optional['Privilege']:
        """
        Повышает привилегию пользователя до следующей относительно текущего threshold.
        Возвращает новую привилегию или None, если следующей нет.
        """
        next_priv = await self._next_privilege(up=True)
        if next_priv: await next_priv.rcon_give_to(self)
        xlm = await self.arelated('xlmine_user')
        xlm.privilege = next_priv
        await xlm.asave()
        return next_priv

    async def downgrade_privilege(self: 'User') -> Optional['Privilege']:
        """
        Понижает привилегию пользователя до предыдущей (нижней) относительно текущего threshold.
        Возвращает новую привилегию или None, если предыдущей нет.
        """
        prev_priv = await self._next_privilege(up=False)
        if prev_priv: await prev_priv.rcon_give_to(self)
        xlm = await self.arelated('xlmine_user')
        xlm.privilege = prev_priv
        await xlm.asave()
        return prev_priv

    async def rcon_sync_privilege(self: 'User') -> Optional['Privilege']:
        """
        Удаляет все лакипермс‑привилегии пользователя и выставляет актуальную.
        """
        xlmine_user = await self.arelated('xlmine_user')
        curr_priv = xlmine_user.privilege
        if curr_priv: await curr_priv.rcon_give_to(self)
        return curr_priv

    def sync_upgrade_privilege(self: 'User') -> Optional['Privilege']:
        return async_to_sync(self.upgrade_privilege)()

    def sync_downgrade_privilege(self: 'User') -> Optional['Privilege']:
        return async_to_sync(self.downgrade_privilege)()

    def sync_rcon_sync_privilege(self):
        return async_to_sync(self.rcon_sync_privilege)()

    def sync_calc_and_set_current_privilege(self):
        return async_to_sync(self.calc_and_set_current_privilege)()
