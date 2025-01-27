# commerce/exceptions/client.py
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_404_NOT_FOUND, HTTP_403_FORBIDDEN


class ClientException:
    class NotFound(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Client not found.')}
        default_code = 'client_not_found'

    class NotHavePermission(APIException):
        status_code = HTTP_403_FORBIDDEN
        default_detail = {'message': _('You do not have permission to access this client.')}
        default_code = 'not_have_permission'
