# software/exceptions/software.py
from adjango.exceptions.base import ModelApiBaseException


class SoftwareException(ModelApiBaseException):
    class ApiEx(ModelApiBaseException.ApiEx):
        pass
