from adjango.exceptions.base import ModelApiBaseException


class SoftwareException(ModelApiBaseException):
    class ApiEx(ModelApiBaseException.ApiEx):
        pass
