from rest_framework import status
from rest_framework.exceptions import APIException
from transliterate.utils import _


class NoValidLicenseFound(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = _('No valid license found for this software.')
    default_code = 'no_valid_license'


class SoftwareFileNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = _('Software file not found.')
    default_code = 'software_file_not_found'


class InsufficientFundsError(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = _('Insufficient funds to complete the subscription.')
    default_code = 'insufficient_funds'
