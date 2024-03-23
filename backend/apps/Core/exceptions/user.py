from rest_framework import status
from rest_framework.exceptions import APIException
from transliterate.utils import _


class UserExceptions:
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

    class AlreadyThisUsername(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {
            'message': _('You already have this username installed.')
        }
        default_code = 'already_this_username'

    class UserWithThisEmailNotFound(APIException):
        status_code = status.HTTP_404_NOT_FOUND
        default_detail = {
            'message': _('User with this email not found.')
        }
        default_code = 'user_with_this_email_not_found'
