# tbank/decorators/base.py

import logging
from functools import wraps

from adjango.utils.common import traceback_str
from asgiref.sync import sync_to_async
from rest_framework.exceptions import APIException
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from apps.commerce.models import Order
from apps.tbank.consts import TBANK_NOTIFICATION_ALLOWED_URLS
from apps.tbank.exceptions.base import TBankException
from apps.tbank.models import TBankPayment
from apps.tbank.services.payment import TBankPaymentService

log = logging.getLogger('global')


def async_tbank_payment_notification(view_func):
    @wraps(view_func)
    async def _wrapped_view(request, *args, **kwargs):
        try:
            log.info('Stage #1')
            log.info(f'REQUEST DATA:\n{dict(request.data)}')
            request.critical_error = None
            AUTHORIZED = TBankPayment.Status.AUTHORIZED
            CONFIRMED = TBankPayment.Status.CONFIRMED
            request.success = True if request.data.get('Success') in ('true', True) else False
            payment_id = request.data.get('PaymentId')
            status = request.data.get('Status')
            card_id = request.data.get('CardId')
            source = request.data.get('Data', {}).get('Source')
            user_agent = request.data.get('Data', {}).get('user_agent')
            request.is_payment_confirmed = False
            request.need_waiting = False

            log.info('Stage #2')
            if request.method == 'POST':
                log.info('Stage #3')
                if not all((status, payment_id)): raise TBankException.Notification.WrongParams()
                if request.ip not in TBANK_NOTIFICATION_ALLOWED_URLS and request.ip != '178.250.157.153':
                    raise TBankException.Notification.IpNotAllowed(f'{request.ip} ip is not allowed')
            elif request.method == 'GET':
                log.info('Stage #4')
                if not payment_id: raise TBankException.Notification.WrongParams()
                status = await TBankPaymentService.actual_status(payment_id)
            try:
                log.info('Stage #5')
                request.payment = await TBankPayment.objects.select_for_update().aget(id=payment_id)
                log.info('Stage #6')
            except TBankPayment.DoesNotExist:
                log.info('Stage #7')
                log.critical(f'TBankPayment {payment_id} DoesNotExist')
                raise TBankException.Payment.DoesNotExist()

            log.info('Stage #8')
            if request.payment.status != status:
                log.info('Stage #9')
                request.payment.status = status
            if source:
                request.payment.source = source
                if source == TBankPayment.Source.CARDS:
                    request.payment.commission = 3.9
                elif source == TBankPayment.Source.QRSBP:
                    request.payment.commission = 0.4
            if card_id: request.payment.card_id = card_id
            if user_agent and len(user_agent) < 500: request.payment.user_agent = user_agent
            await request.payment.asave()
            log.info('Stage #10')
            request.is_payment_confirmed = status in (CONFIRMED, AUTHORIZED)
            log.info('Stage #11')
            order: Order = await Order.objects.select_for_update().aget(
                payment_id=payment_id
            )
            log.info('Stage #12')
            request.order = await order.aget_real_instance()
            await sync_to_async(log.info)(request.order)  # noqa
            log.info('Stage #13')
            return await view_func(request, *args, **kwargs)

        except APIException as e:
            log.info('Stage #14')
            renderer = JSONRenderer()
            response = Response(data=e.detail, status=e.status_code)
            log.critical(f'API Exception: {str(e.detail)}')
            response.accepted_renderer = renderer
            response.accepted_media_type = renderer.media_type
            response.renderer_context = {'request': request}
            return response
        except Exception as e:
            log.info('Stage #15')
            request.critical_error = traceback_str(e)
            if ('LockNotAvailable'
                    in request.critical_error
                    or
                    'OperationalError: canceling statement due to lock timeout'
                    in request.critical_error):
                log.critical(f'Похоже нотификация и клиентский запрос конфликтуют')
                request.critical_error = None
                request.need_waiting = True
            log.critical(f'TBank Payment Notification Error: {request.critical_error}')
            return await view_func(request, *args, **kwargs)

    return _wrapped_view
