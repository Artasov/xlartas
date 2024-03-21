from rest_framework import status
from rest_framework.exceptions import APIException
from transliterate.utils import _


class UsernameAlreadyExists(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = {
        'message': _('A user with that username already exists')
    }
    default_code = 'username_already_exists'


class UserEmailAlreadyExists(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = {
        'message': _('A user with that email already exists')
    }
    default_code = 'user_email_already_exists'
