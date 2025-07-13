# commerce/exceptions/product.py
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import (
    HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST
)


class _ProductException:
    class NotFound(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Product not found.')}
        default_code = 'product_not_found'

    class UnknownType(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('Unknown product type.')}
        default_code = 'product_unknown_type'
