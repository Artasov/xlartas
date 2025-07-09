# core/confirmations/funcs.py
from typing import TYPE_CHECKING

from apps.core.exceptions.user import UserException
from apps.core.models import User
from apps.core.services.auth import JWTPair, new_jwt_for_user

if TYPE_CHECKING: from apps.confirmation.models.base import ConfirmationCode


async def auth_by_confirmation_code(code: 'ConfirmationCode') -> JWTPair:
    from apps.confirmation.models.base import EmailConfirmationCode, PhoneConfirmationCode
    jwt_pair = new_jwt_for_user(code.user)
    if not code.user.is_email_confirmed and isinstance(code, EmailConfirmationCode):
        code.user.is_email_confirmed = True
        await code.user.asave()
    elif not code.user.is_phone_confirmed and isinstance(code, PhoneConfirmationCode):
        code.user.is_phone_confirmed = True
        await code.user.asave()
    return jwt_pair


async def signup_by_confirmation_code(code: 'ConfirmationCode') -> JWTPair:
    from apps.confirmation.models.base import EmailConfirmationCode, PhoneConfirmationCode
    if not code.user.is_email_confirmed and isinstance(code, EmailConfirmationCode):
        code.user.is_email_confirmed = True
        await code.user.asave()
    elif not code.user.is_phone_confirmed and isinstance(code, PhoneConfirmationCode):
        code.user.is_phone_confirmed = True
        await code.user.asave()
    jwt_pair = new_jwt_for_user(code.user)
    return jwt_pair


async def set_new_password_by_confirmation_code(code: 'ConfirmationCode', new_password: str):
    code.user.set_password(new_password)
    await code.user.asave()


async def confirm_email_action(code: 'ConfirmationCode'):
    if not code.user.is_email_confirmed:
        code.user.is_email_confirmed = True
        await code.user.asave()


async def confirm_phone_action(code: 'ConfirmationCode', new_phone: str):
    """Confirm phone number and update it if necessary."""
    # Ensure the phone number does not belong to another user
    existing_user = await User.objects.by_creds(new_phone)
    if existing_user and existing_user.pk != code.user.pk:
        raise UserException.AlreadyExistsWithThisPhone()

    # Update phone if it differs from the current one
    if code.user.phone != new_phone:
        code.user.phone = new_phone

    # Mark phone as confirmed
    if not code.user.is_phone_confirmed:
        code.user.is_phone_confirmed = True

    await code.user.asave()
