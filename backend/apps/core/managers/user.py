from typing import Optional, TYPE_CHECKING

from adjango.managers.base import AUserManager
from adjango.utils.base import is_email, is_phone, phone_format

if TYPE_CHECKING:
    from core.models.user import User


class UserManager(AUserManager):
    async def by_creds(self, credential) -> Optional['User']:
        """ phone / email / username """
        try:
            if is_email(credential):
                return await self.aget(email=credential)
            elif is_phone(credential):
                return await self.aget(phone=phone_format(credential))
            else:
                return await self.aget(username=credential)
        except User.DoesNotExist:
            return
