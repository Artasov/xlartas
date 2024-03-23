import uuid
from typing import TypedDict

from django.db.models import Model, ForeignKey, CharField, DateTimeField, CASCADE, UUIDField, BooleanField, TextChoices

from apps.Core.models.user import User


class ActionsMail(TypedDict):
    subject: str
    text: str


class ActionTypes(TextChoices):
    SIGNUP = 'signup', 'Sign Up'
    RESET_PASSWORD = 'reset_password'


ActionsMails = {
    ActionTypes.SIGNUP: ActionsMail(
        subject='xlartas | Confirm email',
        text='This is the confirmation code for email at xlartas.ru'
    ),
    ActionTypes.RESET_PASSWORD: ActionsMail(
        subject='xlartas | Reset password',
        text='This is the confirmation code for reset password at xlartas.ru'
    )
}


class ConfirmationCode(Model):
    user = ForeignKey(User, on_delete=CASCADE, related_name='confirmation_codes')
    code = UUIDField(default=uuid.uuid4, editable=False, unique=True)
    action = CharField(max_length=20, choices=ActionTypes.choices)
    is_used = BooleanField(default=False)
    expired_at = DateTimeField()
    created_at = DateTimeField(auto_now_add=True)
