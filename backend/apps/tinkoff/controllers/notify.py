import hashlib
import logging
from collections import OrderedDict
from typing import TypedDict

from adrf.decorators import api_view
from django.conf import settings
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.Core.exceptions.base import CoreExceptions
from apps.tinkoff.services.orders import execute_tinkoff_deposit_order_by_id

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

    for key in params.keys():
        if params[key] == 'True':
            params[key] = 'true'
        elif params[key] == 'False':
            params[key] = 'false'
        elif isinstance(params[key], bool):
            params[key] = 'true' if params[key] else 'false'

    params['Password'] = settings.TINKOFF_PASSWORD

    sorted_parameters = OrderedDict(sorted(params.items()))
    concatenated_values = ''.join(str(sorted_parameters[key]) for key in sorted_parameters)
    token_hash = hashlib.sha256(concatenated_values.encode('utf-8')).hexdigest()

    return token_hash


def check_tinkoff_token(notification: TinkoffPaymentNotification) -> bool:
    token = str(notification.get('Token'))
    expected_token = generate_token(notification)
    provided_token = token
    return expected_token == provided_token


@api_view(('POST',))
@permission_classes((AllowAny,))
async def notify(request) -> Response:
    notify_ = TinkoffPaymentNotification(**request.data)
    if check_tinkoff_token(notify_):
        if notify_.get('Success'):
            order_id = notify_.get('OrderId')
            if order_id:
                await execute_tinkoff_deposit_order_by_id(order_id=order_id)
                return Response('Order executed successfully.')
    raise CoreExceptions.SomethingGoWrong()
