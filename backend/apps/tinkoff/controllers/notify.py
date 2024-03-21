import hashlib
import logging
from typing import TypedDict

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.shop.services.orders import execute_order_by_id

log = logging.getLogger('base')


class TinkoffPaymentNotification(TypedDict):
    TerminalKey: str
    OrderId: str
    Success: bool
    Status: str
    PaymentId: int
    ErrorCode: str
    Amount: int
    CardId: int
    Pan: str
    ExpDate: str
    Token: str


def generate_token(parameters: TinkoffPaymentNotification) -> str:
    sorted_keys = sorted(parameters.keys())
    sorted_parameters = {key: parameters[key] for key in sorted_keys if key != 'Token'}
    sorted_parameters[settings.TINKOFF_PASSWORD_KEY] = settings.TINKOFF_PASSWORD
    concatenated_values = "".join(str(value) for value in sorted_parameters.values())
    return hashlib.sha256(concatenated_values.encode('utf-8')).hexdigest()


def check_tinkoff_token(notification: TinkoffPaymentNotification) -> bool:
    provided_token = notification['Token']
    generated_token = generate_token(notification)
    return provided_token == generated_token


@csrf_exempt
@api_view(('GET', 'POST'))
@permission_classes((AllowAny,))
def notify(request) -> Response:
    log.critical('||||||||||||||||||NOTIFY||||||||||||||||||')
    print(request.data)
    notify_ = TinkoffPaymentNotification(**request.data)
    log.critical('||||||||||||||||||next1||||||||||||||||||')
    if check_tinkoff_token(notify_):
        log.critical('||||||||||||||||||next2||||||||||||||||||')
        if notify_.get('Success'):
            log.critical('||||||||||||||||||next3||||||||||||||||||')
            order_id = notify_.get('OrderId')
            if order_id:
                execute_order_by_id(order_id=order_id)
                return Response('Order executed successfully.')

    log.critical('||||||||||||||||||next4||||||||||||||||||')