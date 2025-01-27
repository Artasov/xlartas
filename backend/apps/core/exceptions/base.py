# core/exceptions/base.py

from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class CoreException:
    class SomethingGoWrong(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Sorry, something went wrong. We are already working to resolve the problem.')}
        default_code = 'username_already_exists'

    class WrongFilledFields(APIException):
        status_code = status.HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Correct the mistakes.')}
        default_code = 'wrong_filled_fields'

    class AccessDenied(APIException):
        status_code = status.HTTP_403_FORBIDDEN
        default_detail = {'message': _('Access denied.')}
        default_code = 'access_denied'

    class CaptchaInvalid(APIException):
        status_code = status.HTTP_403_FORBIDDEN
        default_detail = {'message': _('Looks like there was a captcha error. Please try again.')}
        default_code = 'Captcha Invalid'
