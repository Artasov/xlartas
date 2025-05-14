# commerce/controllers/tbank/notification.py
import logging

from adjango.adecorators import acontroller, aforce_data, aatomic
from adjango.utils.common import traceback_str
from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.commerce.exceptions.order import OrderException
from apps.tbank.decorators.base import async_tbank_payment_notification

log = logging.getLogger('global')


@acontroller('TBank Notification', 'global')
@aatomic
@api_view(('POST', 'GET'))
@permission_classes((AllowAny,))
@aforce_data
@async_tbank_payment_notification
async def notification(request):
    log.info('Stage #16')
    if request.need_waiting:
        return redirect(
            f'{settings.DOMAIN_URL}/orders/?success_message=Вероятно оплата уже прошла, загляните в архив заказов')
    if request.critical_error:
        log.info('Stage #17')
        if request.method == 'GET':
            log.info('Stage #18')
            return redirect(f'{settings.DOMAIN_URL}/orders/?error_message=Оплата не прошла. #2346')
        log.info('Stage #19')
        return Response(status=HTTP_400_BAD_REQUEST)
    await sync_to_async(log.info)(f'{request.success=}')  # noqa
    await sync_to_async(log.info)(f'{request.is_payment_confirmed=}')  # noqa
    await sync_to_async(log.info)(f'{request.order=}')  # noqa
    if request.success and request.is_payment_confirmed and request.order:
        log.info('Stage #20')
        request.order.payment = await request.order.arelated('payment')
        try:
            log.info('Stage #21')
            request.order.is_paid = True
            request.order.payment.is_paid = True
            await request.order.asave()
            await request.order.payment.asave()
            try:
                log.info('Stage #22')
                await request.order.execute()
            except OrderException.AlreadyExecuted:
                log.info('Stage #23')
                pass
            if request.method == 'GET':
                log.info('Stage #24')
                return redirect(f'{settings.DOMAIN_URL}/orders/?success_message=Заказ успешно оплачен!')
        except Exception as e:
            log.info('Stage #25')
            request.order.user = await request.order.arelated('user')
            await sync_to_async(log.critical)(
                f'Order Executing Error: {traceback_str(e)}\n'
                f'Order ID: {request.order.id}\n'
                f'User: {request.order.user.id}\n'
                f'Payment: {request.payment.id}\n'
                f'Request Data: {request.data}\n',
            )  # noqa
            log.info('Stage #26')
            return Response(status=HTTP_400_BAD_REQUEST)
        log.info('Stage #27')
        return Response(HTTP_200_OK)
    if request.method == 'GET':
        log.info('Stage #28')
        return redirect(f'{settings.DOMAIN_URL}/orders/?error_message=Оплата не прошла. #3458')
    log.info('Stage #29')
    return Response(status=HTTP_400_BAD_REQUEST)
