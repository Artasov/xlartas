# core/services/user/base.py
import string
from random import choices
from typing import TYPE_CHECKING

from apps.core.services.base import BaseService

if TYPE_CHECKING:
    from apps.core.models import User


def generate_random_username():
    return 'U' + ''.join(choices(string.ascii_uppercase + string.digits, k=11))


class UserBaseService(BaseService):
    def __init__(self, user: 'User') -> None:
        self.user = user
