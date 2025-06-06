# core/confirmations/actions.py
from typing import TYPE_CHECKING

from django.conf import settings
from django.utils.translation import gettext_lazy as _

from apps.confirmation.services.actions import ConfirmationAction
from apps.core.confirmations.funcs import (
    auth_by_confirmation_code, set_new_password_by_confirmation_code,
    confirm_email_action, confirm_phone_action, signup_by_confirmation_code
)

if TYPE_CHECKING: pass


class CoreConfirmationActionType:
    AUTH = 'auth'
    SIGNUP = 'signup'
    NEW_PASSWORD = 'new_password'
    NEW_EMAIL = 'new_email'
    NEW_PHONE = 'new_phone'


# subject не учитывается для SMS !!!
actions = {
    CoreConfirmationActionType.AUTH: ConfirmationAction(
        subject=f'xlartas | {_('Confirm auth')}',
        text=f'{_('Код подтверждения для входа в вашу учетную запись')}',
        func=auth_by_confirmation_code,
    ),
    CoreConfirmationActionType.SIGNUP: ConfirmationAction(
        subject=f'xlartas | {_('Confirm Registration')}',
        text=f'{_('Код подтверждения для регистрации')}',
        func=signup_by_confirmation_code,
    ),
    CoreConfirmationActionType.NEW_PASSWORD: ConfirmationAction(
        subject=f'xlartas | {_('Set new password')}',
        text=f'{_('Код подтверждения для нового пароля')}',
        func=set_new_password_by_confirmation_code,
    ),
    CoreConfirmationActionType.NEW_EMAIL: ConfirmationAction(
        subject=f'xlartas | {_('Add new email address')}',
        text=f'{_('Код подтверждения для добавления почты')}',
        func=confirm_email_action,
    ),
    CoreConfirmationActionType.NEW_PHONE: ConfirmationAction(
        subject=f'xlartas | {_('Add new phone number')}',
        text=f'{_('Код подтверждения для добавления телефона')} {settings.MAIN_DOMAIN}',
        func=confirm_phone_action,
    ),
}
