import uuid
from typing import TypedDict

from adjango.models import AModel
from django.db.models import Model, ForeignKey, CharField, DateTimeField, CASCADE, UUIDField, BooleanField, TextChoices

from apps.core.models.user import User


class ActionsMail(TypedDict):
    subject: str
    text: str


class ActionTypes(TextChoices):
    SIGNUP = 'signup', 'Sign Up'
    RESET_PASSWORD = 'reset_password', 'Reset Password'
    SURVEY_ACCESS = 'survey_access', 'Survey Access'
    AUTO_CREATED_USER = 'auto_created_user', 'Auto Created User'


ActionsMails = {
    ActionTypes.SIGNUP: ActionsMail(
        subject='xlartas | Confirm email',
        text='This is the confirmation code for email at xlartas.ru'
    ),
    ActionTypes.RESET_PASSWORD: ActionsMail(
        subject='xlartas | Reset password',
        text='This is the confirmation code for reset password at xlartas.ru'
    ),
    ActionTypes.SURVEY_ACCESS: ActionsMail(
        subject='xlartas | Survey Access',
        text='Access to survey granted xlartas.ru. Survey link below.'
    ),
    ActionTypes.AUTO_CREATED_USER: ActionsMail(
        subject='xlartas | User auto-create',
        text='An account on xlartas.ru was automatically created for you. Below are your account login details.'
    )
}


class ConfirmationCode(AModel):
    user = ForeignKey(User, on_delete=CASCADE, related_name='confirmation_codes')
    code = UUIDField(default=uuid.uuid4, editable=False, unique=True)
    action = CharField(max_length=20, choices=ActionTypes.choices)
    is_used = BooleanField(default=False)
    expired_at = DateTimeField()
    created_at = DateTimeField(auto_now_add=True)
