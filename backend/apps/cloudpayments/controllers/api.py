# apps/cloudpayments/views.py
import logging
from pprint import pprint
from typing import Any, Dict

from adjango.adecorators import acontroller, aatomic
from adjango.utils.common import traceback_str
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.cloudpayments.models import CloudPaymentPayment
from apps.cloudpayments.services.payment import CloudPaymentService
from apps.commerce.exceptions.order import OrderException
from apps.commerce.models import Order

log = logging.getLogger('global')


@acontroller('CloudPayments Success')
@aatomic
@api_view(('POST',))
@permission_classes((AllowAny,))
async def success(request):
    """
    Получаем данные onSuccess из виджета.
    Проверяем через CloudPayments API, что платёж действительно прошёл,
    и, если всё в порядке, помечаем заказ как «оплачен» и выполняем его.
    """
    try:
        data: Dict[str, Any] = request.data
        pprint(data)

        invoice_id: str | None = data.get('invoiceId')
        if not invoice_id:
            log.error('[CP] wrong payload – no invoiceId')
            return Response(
                {'detail': 'invoiceId is required'},
                status=HTTP_400_BAD_REQUEST,
            )

        order: Order = await Order.objects.select_for_update().aget(pk=invoice_id)
        order.payment = await order.arelated('payment')  # CloudPaymentPayment
        payment: CloudPaymentPayment = order.payment

        # --- проверяем статус транзакции у CloudPayments ---
        is_confirmed: bool = await CloudPaymentService.actual_status(invoice_id)
        if not is_confirmed:
            log.warning('[CP] Payment not confirmed for %s', invoice_id)
            return Response(
                {'detail': 'payment not confirmed'},
                status=HTTP_400_BAD_REQUEST,
            )

        # --- помечаем как оплачено ---
        order.is_paid = True
        payment.is_paid = True
        payment.status = CloudPaymentPayment.Status.COMPLETED
        await order.asave()
        await payment.asave()

        # --- выполняем сам заказ ---
        try:
            await order.execute()
        except OrderException.AlreadyExecuted:
            # уже был выполнен, ничего страшного
            pass

        return Response({'success': True}, status=HTTP_200_OK)

    except Exception as e:
        log.critical(f'[CP] Success handler error {traceback_str(e)}')
        return Response(
            {'detail': 'Critical error'},
            status=HTTP_400_BAD_REQUEST,
        )
