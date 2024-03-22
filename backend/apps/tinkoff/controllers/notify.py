import hashlib
import logging
from collections import OrderedDict
from typing import TypedDict

from adrf.decorators import api_view
from django.conf import settings
from rest_framework.decorators import permission_classes
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
    params = {k: v for k, v in parameters.items() if
              k not in ('Shops', 'DATA', 'Receipt', 'Token')}
    log.critical(params)

    for key in params.keys():
        if params[key] == 'True':
            params[key] = 'true'
        elif params[key] == 'False':
            params[key] = 'false'
        elif isinstance(params[key], bool):
            params[key] = 'true' if params[key] else 'false'

    params['Password'] = settings.TINKOFF_PASSWORD

    sorted_parameters = OrderedDict(sorted(params.items()))
    log.critical(sorted_parameters)
    concatenated_values = ''.join(str(sorted_parameters[key]) for key in sorted_parameters)
    log.critical(concatenated_values)
    token_hash = hashlib.sha256(concatenated_values.encode('utf-8')).hexdigest()

    return token_hash


def check_tinkoff_token(notification: TinkoffPaymentNotification) -> bool:
    print('#########')
    print(notification)
    token = str(notification.get('Token'))
    expected_token = generate_token(notification)
    provided_token = token

    log.critical("=========================")
    log.critical(expected_token)
    log.critical(provided_token)
    return expected_token == provided_token


@api_view(('GET', 'POST'))
@permission_classes((AllowAny,))
async def notify(request) -> Response:
    log.critical('||||||||||||||||||NOTIFY||||||||||||||||||')
    print(request.data)
    notify_ = TinkoffPaymentNotification(**request.data)
    log.critical('||||||||||||||||||next1||||||||||||||||||')
    if check_tinkoff_token(notify_):
        log.critical('||||||||||||||||||next2||||||||||||||||||')
        if notify_.get('Success'):
            log.critical('||||||||||||||||||next3||||||||||||||||||')
            order_id = notify_.get('OrderId')
            print(type(order_id))
            if order_id:
                await execute_order_by_id(order_id=order_id)
                return Response('Order executed successfully.')

    log.critical('||||||||||||||||||next4||||||||||||||||||')
