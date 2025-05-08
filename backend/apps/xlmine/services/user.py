# xlmine/services/user.py
from typing import TYPE_CHECKING

from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile

if TYPE_CHECKING:
    from apps.core.models import User


class UserXLMineService:

    async def xlmine_uuid(self: 'User') -> str:
        from apps.xlmine.models.user import UserXLMine
        xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=self)
        return xlmine_user.uuid

    async def set_skin(self: 'User', skin_file: UploadedFile) -> str:
        """
        Сохраняет файл скина и сразу же посылает RCON‑команду:
          /skin player <username> set <url>
        """
        from apps.xlmine.models.user import UserXLMine
        from apps.xlmine.services.server.console import RconServerConsole

        # 1. Сохраняем файл в модели (Media / CDN и т.п.)
        xlm, _ = await UserXLMine.objects.aget_or_create(user=self)
        if xlm.skin:
            xlm.skin.delete(save=False)
        await sync_to_async(xlm.skin.save)(
            skin_file.name, skin_file, save=True
        )

        # 2. Берём публичный URL из поля FileField
        skin_url = settings.DOMAIN_URL + xlm.skin.url

        # 3. Шлём команду на сервер по RCON
        rcon = RconServerConsole()
        return rcon.send_command(
            # f'skinsrestorer:skin set {skin_url} {self.username} classic'
            f'skin set web classic "{skin_url}" {self.username}'
        )

    async def clear_skin(self: 'User') -> str:
        """
        Удаляем локально файл скина и шлём RCON‑команду:
          /skin player <username> clear
        """
        from apps.xlmine.models.user import UserXLMine
        from apps.xlmine.services.server.console import RconServerConsole

        xlm, _ = await UserXLMine.objects.aget_or_create(user=self)
        if xlm.skin:
            xlm.skin.delete(save=False)
            await sync_to_async(xlm.asave)()

        rcon = RconServerConsole()
        return rcon.send_command(f"skin player {self.username} clear")

    async def set_cape(self: 'User', cape_file: UploadedFile) -> str:
        """
        Сохраняет файл плаща и сразу же посылает RCON‑команду:
          /cape player <username> set <url>
        """
        from apps.xlmine.models.user import UserXLMine
        from apps.xlmine.services.server.console import RconServerConsole

        xlm, _ = await UserXLMine.objects.aget_or_create(user=self)
        if xlm.cape:
            xlm.cape.delete(save=False)
        await sync_to_async(xlm.cape.save)(
            cape_file.name, cape_file, save=True
        )

        cape_url = settings.DOMAIN_URL + xlm.cape.url

        rcon = RconServerConsole()
        return rcon.send_command(
            f"cape player {self.username} set {cape_url}"
        )

    async def clear_cape(self: 'User') -> str:
        """
        Удаляем локально файл плаща и шлём RCON‑команду:
          /cape player <username> clear
        """
        from apps.xlmine.models.user import UserXLMine
        from apps.xlmine.services.server.console import RconServerConsole

        xlm, _ = await UserXLMine.objects.aget_or_create(user=self)
        if xlm.cape:
            xlm.cape.delete(save=False)
            await sync_to_async(xlm.asave)()

        rcon = RconServerConsole()
        return rcon.send_command(f"cape player {self.username} clear")
