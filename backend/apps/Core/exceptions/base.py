from typing import TypedDict, List

from rest_framework import status
from rest_framework.exceptions import APIException
from transliterate.utils import _

from apps.Core.messages.errors import CORRECT_ERRORS_IN_FIELDS, SOMETHING_GO_WRONG


class FieldError(TypedDict):
    field: str
    message: str


def serializer_errors_to_field_errors(serializer_errors) -> List[FieldError]:
    field_errors = []
    for field, messages in serializer_errors.items():
        for message in messages:
            field_errors.append(FieldError(
                field=field,
                message=_(message)
            ))
    return field_errors


class DetailExceptionDict(TypedDict):
    message: str
    fields_errors: List[FieldError]


class DetailAPIException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: DetailExceptionDict, code: str = None, status_code: str = None):
        if status_code is not None:
            self.status_code = status_code
        super().__init__(detail=detail, code=code or 'error')


class SerializerErrors(DetailAPIException):
    def __init__(self, message: str, serializer_errors: dict, code: str = None, status_code: str = None):
        detail = DetailExceptionDict(
            message=message,
            fields_errors=serializer_errors_to_field_errors(serializer_errors)
        )
        super().__init__(detail=detail, code=code, status_code=status_code)


class SomethingGoWrong(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': SOMETHING_GO_WRONG}
    default_code = 'username_already_exists'


class WrongFilledFields(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': CORRECT_ERRORS_IN_FIELDS}
    default_code = 'wrong_filled_fields'
