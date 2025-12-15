# core/services/user/base.py
import string
from random import choices
from typing import TYPE_CHECKING

from adjango.services.base import ABaseService

if TYPE_CHECKING:
    from apps.core.models import User


USERNAME_MAX_LENGTH = 14


def normalize_username(username: str) -> str:
    return username[:USERNAME_MAX_LENGTH]


def generate_random_username():
    return 'U' + ''.join(choices(string.ascii_uppercase + string.digits, k=11))


class UserBaseService(ABaseService):
    def __init__(self, obj: 'User') -> None:
        super().__init__(obj)
        self.user = obj
