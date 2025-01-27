# confirmation/managers/base.py
from typing import TYPE_CHECKING, Union

from adjango.managers.polymorphic import APolymorphicManager

if TYPE_CHECKING:
    from apps.confirmation.models.base import (
        ConfirmationCode
    )


class ConfirmationCodeManager(APolymorphicManager):
    """
    @method aget_latest: Получает последний код подтверждения по указанным фильтрам.
    """

    async def aget_latest(self, **kwargs) -> Union['ConfirmationCode', None]:
        from apps.confirmation.models.base import ConfirmationCode
        try:
            return await self.filter(**kwargs).alatest('created_at')
        except ConfirmationCode.DoesNotExist:
            return
