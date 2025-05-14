# cloudpayments/exceptions/base.py
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class CloudPaymentsException:
    class Payment:
        class DoesNotExist(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('TBank payment does not exist.')}
            default_code = 'tbank_payment_does_not_exist'

        class FailedToInitialize(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('TBank payment failed to initialize.')}
            default_code = 'tbank_payment_failed_to_initialize'

    class Status:
        class RealPaidStatusAndNotificationNotMatch(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('The real status and notification status did not match.')}
            default_code = 'tbank_real_status_and_notification_not_match'

    class Notification:
        class IpNotAllowed(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('The ip address is not allowed for notification.')}
            default_code = 'tbank_notification_ip_not_allowed'

        class WrongParams(APIException):
            status_code = status.HTTP_400_BAD_REQUEST
            default_detail = {'message': _('Invalid notification parameters.')}
            default_code = 'wrong_notification_parameters'
