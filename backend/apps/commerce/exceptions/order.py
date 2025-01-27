# commerce/exceptions/order.py
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException
from rest_framework.status import (
    HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND
)


class OrderException:
    class UnknownOrderInstance(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Unknown order instance')}
        default_code = 'unknown_order_instance'

    class CannotExecuteRefunded(APIException):
        status_code = HTTP_403_FORBIDDEN
        default_detail = {'message': _('The order cannot be processed because it has already been returned.')}
        default_code = 'cannot_execute_refunded'

    class NotFound(APIException):
        status_code = HTTP_404_NOT_FOUND
        default_detail = {'message': _('Order not found')}
        default_code = 'order_not_found'

    class CannotCancelPaid(APIException):
        status_code = HTTP_403_FORBIDDEN
        default_detail = {
            'message': _('To cancel a paid order and get a refund, please contact us.')}
        default_code = 'cannot_cancel_paid'

    class CannotCancelRefunded(APIException):
        status_code = HTTP_403_FORBIDDEN
        default_detail = {'message': _('The order cannot be canceled because it refunded.')}
        default_code = 'cannot_cancel_refunded'

    class AlreadyExecuted(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The order has already been completed.')}
        default_code = 'order_already_executed'

    class AlreadyCanceled(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The order has already been cancelled.')}
        default_code = 'order_already_canceled'

    class NotExecutedYet(APIException):
        status_code = HTTP_400_BAD_REQUEST
        default_detail = {'message': _('The order has not yet been completed.')}
        default_code = 'order_not_executed_yet'
