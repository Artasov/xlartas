# commerce/services/payment/exceptions.py
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
)


class _PaymentException:
    class CurrencyNotSupported(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Currency not supported.')}
        default_code = 'currency_not_supported'

    class CurrencyNotSupportedForPaymentSystem(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The payment system is not supported for currencies.')}
        default_code = 'currency_not_supported_for_payment_system'

    class PaymentSystemNotFound(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Payment system not found.')}
        default_code = 'payment_system_not_found'

    class InitError(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Init error.')}
        default_code = 'init_error'
