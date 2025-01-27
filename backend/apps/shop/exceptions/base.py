# shop/exceptions/base.py
from rest_framework import status
from rest_framework.exceptions import APIException

from apps.shop.messages.errors import (
    FAILED_TO_ACTIVATE_TEST_PERIOD, PROGRAM_NOT_FOUND, INSUFFICIENT_FUNDS,
    SOFTWARE_FILE_NOT_FOUND, NO_VALID_LICENSE_FOUND, TEST_PERIOD_ALREADY_USED
)


class TestPeriodActivationFailed(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = {'message': FAILED_TO_ACTIVATE_TEST_PERIOD}
    default_code = 'test_period_activation_failed'


class TestPeriodAlreadyUsed(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': TEST_PERIOD_ALREADY_USED}
    default_code = 'test_period_already_used'


class NoValidLicenseFound(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = {'message': NO_VALID_LICENSE_FOUND}
    default_code = 'no_valid_license'


class SoftwareFileNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = {'message': SOFTWARE_FILE_NOT_FOUND}
    default_code = 'software_file_not_found'


class InsufficientFundsError(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = {'message': INSUFFICIENT_FUNDS}
    default_code = 'insufficient_funds'


class SoftwareByNameNotFound(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': PROGRAM_NOT_FOUND}
    default_code = 'software_by_name_not_found'
