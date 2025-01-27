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
    # TODO: Функция должна обновлять phone корректно, сейчас она просто устанавливает phone если еще нет
    if await User.objects.filter(phone=new_phone).aexists():
        raise UserException.AlreadyExistsWithThisPhone()
    if not code.user.phone or not code.user.is_phone_confirmed:
        code.user.phone = new_phone
        code.user.is_phone_confirmed = True
        await code.user.asave()
