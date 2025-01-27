# filehost/exceptions/base.py
from rest_framework import status
from rest_framework.exceptions import APIException


class StorageLimitExceeded(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': 'Storage limit exceeded.'}
    default_code = 'storage_limit_exceeded'


class IdWasNotProvided(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = {'message': 'Id was not provided.'}
    default_code = 'id_was_not_provided'
