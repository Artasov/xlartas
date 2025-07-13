# ckassa/controllers/api.py
import logging
from typing import Any, Dict

from adjango.adecorators import acontroller, aatomic
from adrf.decorators import api_view
from django.shortcuts import redirect
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.ckassa.consts import CKASSA_NOTIFICATION_ALLOWED_URLS
from apps.ckassa.models import CKassaPayment
from apps.commerce.models import Order

log = logging.getLogger('global')


@acontroller('CKassa Notification')
@aatomic
@api_view(('GET', 'POST'))
@permission_classes((AllowAny,))
async def notification(request):
    data: Dict[str, Any] = request.query_params if request.method == 'GET' else request.data
    log.debug('CKassa payload: %s', data)
    reg_pay_num = data.get('regPayNum') or data.get('reg_pay_num')
    order_id = data.get('order_id')

    # Check IP for POST notifications
    if request.method == 'POST' and request.ip not in CKASSA_NOTIFICATION_ALLOWED_URLS:
        log.warning('CKassa notification ip not allowed: %s', request.ip)
        return Response({'detail': 'ip not allowed'}, status=HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        if not order_id:
            return redirect('/orders/')
        return redirect(f'/orders/{order_id}/')

    # order_id may come in properties under key 'НОМЕР ЗАКАЗА'
    if not order_id:
        props: Dict[str, Any] | list | None = data.get('property') or data.get('map')
        if isinstance(props, dict):
            order_id = props.get('НОМЕР ЗАКАЗА') or props.get('номер заказа')

    if not all((reg_pay_num, order_id)):
        return Response({'detail': 'wrong payload'}, status=HTTP_400_BAD_REQUEST)

    order_qs = Order.objects.select_for_update().filter(id__startswith=str(order_id))
    order = await order_qs.afirst()
    if not order:
        return Response({'detail': 'order not found'}, status=HTTP_400_BAD_REQUEST)
    payment: CKassaPayment = await order.arelated('payment')  # type: ignore

    payment.is_paid = True
    payment.status = 'PAYED'
    payment.reg_pay_num = reg_pay_num
    order.is_paid = True
    await payment.asave()
    await order.asave()

    try:
        await order.service.execute()
    except Exception:  # noqa
        log.warning('CKassa payment for order %s failed', order_id, exc_info=True)

    return Response({'success': True}, status=HTTP_200_OK)
