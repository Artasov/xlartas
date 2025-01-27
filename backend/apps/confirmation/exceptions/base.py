# confirmation/exceptions/base.py
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class ConfirmationException:
    class Code:
        class Invalid(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Invalid confirmation code.')}
            default_code = 'confirmation_code_invalid'

        class NotFound(APIException):
            status_code = status.HTTP_404_NOT_FOUND
            default_detail = {'message': _('Confirmation code not found.')}
            default_code = 'confirmation_code_not_found'

        class AlreadyUsed(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Confirmation code already used.')}
            default_code = 'confirmation_code_already_used'

        class Outdated(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Outdated confirmation code.')}
            default_code = 'confirmation_code_outdated'

        class LatestNotFound(APIException):
            status_code = status.HTTP_404_NOT_FOUND
            default_detail = {'message': _('Failed to obtain the latest verification code for the current user.')}
            default_code = 'confirmation_code_latest_not_found'

        class NotLatest(APIException):
            status_code = status.HTTP_403_FORBIDDEN
            default_detail = {'message': _('The code you provided is not the last one made for you.')}
            default_code = 'confirmation_code_not_latest'

        class Expired(APIException):
            status_code = status.HTTP_403_FORBIDDEN
            default_detail = {'message': _('Confirmation code is expired, you can send a new one.')}
            default_code = 'confirmation_code_expired'

        class SentTooOften(APIException):
            status_code = status.HTTP_403_FORBIDDEN
            default_detail = {'message': _('Confirmation code sent too often.')}
            default_code = 'confirmation_code_sent_too_often'

    class Method:
        class Unknown(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Unknown confirmation method.')}
            default_code = 'confirmation_unknown_method'

    class Action:
        class Unknown(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Unknown confirmation  action.')}
            default_code = 'confirmation_unknown_action'

        class DoesNotExists(APIException):
            status_code = status.HTTP_404_NOT_FOUND
            default_detail = {'message': _('Action does not exists.')}
            default_code = 'action_does_not_exists'

        class NotSpecified(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Action not specified.')}
            default_code = 'action_not_specified_error'
