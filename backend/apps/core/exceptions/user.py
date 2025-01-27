# core/exceptions/user.py
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class UserException:
    class EmailDoesNotExists(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The user does not have an email address.')}
        default_code = 'user_email_does_not_exists'

    class IsNotClient(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The user is not a client.')}
        default_code = 'user_is_not_client'

    class PhoneDoesNotExists(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The user does not have a phone number.')}
        default_code = 'user_phone_does_not_exists'

    class WrongCredential(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The credentials provided are not correct.')}
        default_code = 'user_wrong_credential'

    class NotAuthorized(APIException):
        status_code = status.HTTP_401_UNAUTHORIZED
        default_detail = {'message': _('You must be signed in or create an account to perform this action.')}
        default_code = 'not_authorized'

    class UsernameAlreadyExists(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('A user with that username already exists.')}
        default_code = 'username_already_exists'

    class AlreadyExistsWithThisEmail(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('A user with that email already exists.')}
        default_code = 'user_email_already_exists'

    class AlreadyExistsWithThisPhone(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('A user with that phone already exists.')}
        default_code = 'user_phone_already_exists'

    class AlreadyThisUsername(APIException):
        status_code = status.HTTP_409_CONFLICT
        default_detail = {'message': _('You already have this username installed.')}
        default_code = 'already_this_username'

    class UserWithThisEmailNotFound(APIException):
        status_code = status.HTTP_404_NOT_FOUND
        default_detail = {'message': _('User with this email not found.')}
        default_code = 'user_with_this_email_not_found'

    class NotFound(APIException):
        status_code = status.HTTP_404_NOT_FOUND
        default_detail = {'message': _('User not found.')}
        default_code = 'user_not_found'

    class EmailWasNotProvided(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Email is required.')}
        default_code = 'email_was_not_provided'

    class UserIdWasNotProvided(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('User id was not provided.')}
        default_code = 'user_id_was_not_provided'
