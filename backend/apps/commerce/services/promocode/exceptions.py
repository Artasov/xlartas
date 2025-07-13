# commerce/exceptions/promocode.py
from adjango.exceptions.base import ModelApiBaseException
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND


class _PromocodeException(ModelApiBaseException):
    class ApiEx(ModelApiBaseException.ApiEx):
        class NotFound(APIException):
            status_code = HTTP_404_NOT_FOUND
            default_detail = {'message': _('Promocode not found.')}
            default_code = 'promocode_not_found'

        class NotApplicableForCurrency(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Promocode not applicable for this currency.')}
            default_code = 'not_applicable_for_currency'

        class NotApplicableForClient(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Promocode not applicable for this client.')}
            default_code = 'not_applicable_for_client'

        class NotApplicableForProduct(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Promocode not applicable for this product.')}
            default_code = 'not_applicable_for_product'

        class NotStarted(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Promocode not started yet.')}
            default_code = 'promocode_not_started'

        class Expired(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Promocode has expired.')}
            default_code = 'promocode_expired'

        class MaxUsageExceeded(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Maximum usage for this promocode exceeded.')}
            default_code = 'max_usage_exceeded'

        class MaxUsagePerClientExceeded(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Maximum usage per client exceeded.')}
            default_code = 'max_usage_per_client_exceeded'

        class UsageTooFrequent(APIException):
            status_code = HTTP_403_FORBIDDEN
            default_detail = {'message': _('Usage too frequent for this promocode.')}
            default_code = 'usage_too_frequent'
