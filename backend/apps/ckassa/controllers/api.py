import logging
from typing import Any, Dict

from adjango.adecorators import acontroller, aatomic
from adrf.decorators import api_view
from django.shortcuts import redirect
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.commerce.models import Order
from apps.ckassa.models import CKassaPayment

log = logging.getLogger('ckassa')


@acontroller('CKassa Notification')
@aatomic
@api_view(('GET', 'POST'))
@permission_classes((AllowAny,))
async def notification(request):
    data: Dict[str, Any] = request.query_params if request.method == 'GET' else request.data
    log.debug('CKassa payload: %s', data)
    reg_pay_num = data.get('regPayNum') or data.get('reg_pay_num')
    order_id = data.get('order_id')
    if request.method == 'GET':
        if not order_id:
            return Response({'detail': 'missing order id'}, status=HTTP_400_BAD_REQUEST)
        return redirect(f'/orders/{order_id}/')

    if not all((reg_pay_num, order_id)):
        return Response({'detail': 'wrong payload'}, status=HTTP_400_BAD_REQUEST)

    order = await Order.objects.select_for_update().aget(pk=order_id)
    payment: CKassaPayment = await order.arelated('payment')  # type: ignore

    payment.is_paid = True
    payment.status = 'PAYED'
    payment.reg_pay_num = reg_pay_num
    order.is_paid = True
    await payment.asave()
    await order.asave()

    try:
        await order.execute()  # noqa
    except Exception:
        log.warning('CKassa payment for order %s failed', order_id, exc_info=True)

    return Response({'success': True}, status=HTTP_200_OK)
