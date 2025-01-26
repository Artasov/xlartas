from rest_framework import status
from rest_framework.exceptions import APIException
from django.utils.translation import gettext_lazy as _


class ConfirmationCodeNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = {'message': _('Confirmation code not found.')}
    default_code = 'confirmation_code_not_found'


class ConfirmationCodeInvalid(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': _('Invalid confirmation code.')}
    default_code = 'confirmation_code_invalid'


class ConfirmationCodeAlreadyUsed(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': _('Confirmation code already used.')}
    default_code = 'confirmation_code_already_used'


class ConfirmationCodeOutdated(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': _('Outdated confirmation code.')}
    default_code = 'confirmation_code_outdated'


class ConfirmationCodeLatestNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = {'message': _('Failed to obtain the latest verification code for the current user.')}
    default_code = 'confirmation_code_latest_not_found'


class ConfirmationCodeNotLatest(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': _('The code you provided is not the last one made for you.')}
    default_code = 'confirmation_code_not_latest'


class ConfirmationCodeExpired(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': _('Confirmation code is expired, you can send a new one.')}
    default_code = 'confirmation_code_expired'


class InvalidActionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': _('Invalid action.')}
    default_code = 'invalid_action_error'


class ActionNotSpecifiedError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': _('Action not specified.')}
    default_code = 'action_not_specified_error'


class ConfirmationCodeSentTooOften(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': _('Confirmation code sent too often.')}
    default_code = 'confirmation_code_sent_too_often'


class UserAlreadyConfirmed(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': _('User already confirmed.')}
    default_code = 'user_already_confirmed'
