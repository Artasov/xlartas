# software/exceptions/license.py
from adjango.exceptions.base import ModelApiBaseException
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import HTTP_400_BAD_REQUEST


class SoftwareLicenseException(ModelApiBaseException):
    class ApiEx(ModelApiBaseException.ApiEx):
        class TestPeriodAlreadyUsed(APIException):
            status_code = HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Test period already used')}
            default_code = 'test_period_already_used'
