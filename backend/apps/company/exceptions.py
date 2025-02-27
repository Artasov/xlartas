# company/exceptions.py
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_404_NOT_FOUND


class CompanyException:
    class NotFound(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Company not found')}
        default_code = 'company_not_found'


class CompanyDocumentException:
    class NotFound(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Company document not found')}
        default_code = 'company_document_not_found'
