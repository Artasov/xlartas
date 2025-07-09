# core/managers/user.py
from typing import Optional, TYPE_CHECKING

from adjango.managers.base import AUserManager
from adjango.utils.base import phone_format, is_phone, is_email

if TYPE_CHECKING: from apps.core.models import User


class UserManager(AUserManager):
    async def aby_creds(self, credential) -> Optional['User']:
        """ phone / email / username """
        from apps.core.models import User
        try:
            if is_email(credential):
                return await self.aget(email=credential)
            elif is_phone(credential):
                return await self.aget(phone=phone_format(credential))
            else:
                return await self.aget(username=credential)
        except User.DoesNotExist:
            return

    def by_creds(self, credential) -> Optional['User']:
        """ phone / email / username """
        from apps.core.models import User
        try:
            if is_email(credential):
                return self.get(email=credential)
            elif is_phone(credential):
                return self.get(phone=phone_format(credential))
            else:
                return self.get(username=credential)
        except User.DoesNotExist:
            return
