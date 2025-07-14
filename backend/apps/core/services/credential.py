from adjango.utils.base import is_email, is_phone

from apps.core.exceptions.user import UserException
from apps.core.models import User


async def check_credential_exists(credential: str) -> bool:
    """Return ``True`` if a user with given email or phone exists."""
    if not any((is_email(credential), is_phone(credential))):
        raise UserException.WrongCredential()
    user = await User.objects.aby_creds(credential)
    return bool(user)
