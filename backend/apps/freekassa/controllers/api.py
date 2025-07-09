import hashlib
import logging
from typing import Any, Dict

from adjango.adecorators import acontroller, aatomic
from adrf.decorators import api_view
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.commerce.models import Order
from apps.freekassa.models import FreeKassaPayment

log = logging.getLogger('freekassa')


@acontroller('FreeKassa Notification')
@aatomic
@api_view(('GET', 'POST'))
@permission_classes((AllowAny,))
async def notification(request):
    data: Dict[str, Any] = request.query_params if request.method == 'GET' else request.data
    log.debug('FreeKassa payload: %s', data)
    merchant_id = data.get('MERCHANT_ID')
    amount = data.get('AMOUNT')
    order_id = data.get('MERCHANT_ORDER_ID')
    sign = data.get('SIGN')
    if request.method == 'GET':
        if not order_id:
            return Response({'detail': 'missing order id'}, status=HTTP_400_BAD_REQUEST)
        return redirect(f'/orders/{order_id}/')

    if not all((merchant_id, amount, order_id, sign)):
        return Response({'detail': 'wrong payload'}, status=HTTP_400_BAD_REQUEST)

    check_str = f"{merchant_id}:{amount}:{settings.FK_SECRET_WORD2}:{order_id}"
    if hashlib.md5(check_str.encode()).hexdigest() != sign:
        return Response({'detail': 'wrong sign'}, status=HTTP_400_BAD_REQUEST)

    order = await Order.objects.select_for_update().aget(pk=order_id)
    payment: FreeKassaPayment = await order.arelated('payment')  # type: ignore

    payment.is_paid = True
    payment.status = FreeKassaPayment.Status.PAID
    order.is_paid = True
    await payment.asave()
    await order.asave()

    try:
        await order.execute()
    except Exception:  # noqa
        log.warning('FreeKassa payment for order %s failed', order_id, exc_info=True)

    return Response({'success': True}, status=HTTP_200_OK)
