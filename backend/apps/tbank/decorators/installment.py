# tbank/decorators/installment.py
from utils.log import get_global_logger
from functools import wraps

import dateutil.parser
from adjango.utils.common import traceback_str
from rest_framework.exceptions import APIException
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from apps.commerce.models import Order
from apps.tbank.exceptions.base import TBankException
from apps.tbank.models import TBankInstallment

log = get_global_logger()


def async_tbank_installment_notification(view_func):
    """
    Декоратор нотификации TBankInstallment (аналог async_tbank_payment_notification).
    """

    @wraps(view_func)
    async def _wrapped_view(request, *args, **kwargs):
        try:
            log.info('[TBankInstallment] Stage #1')
            log.info(f'[TBankInstallment] REQUEST DATA:\n{dict(request.data)}')
            request.critical_error = None

            # Если нужно, проверяем IP:
            # if request.method == 'POST':
            #     if request.ip not in TBANK_NOTIFICATION_ALLOWED_URLS:
            #         raise TBankException.Notification.IpNotAllowed(f'{request.ip} ip is not allowed')

            # Из Тинькофф Формы приходит 'id' — это их внутренний ID,
            # но у нас order_id = ваш UUID.
            # Либо в docs: 'id' = orderNumber, 'external_order_number' = ...
            tin_id = request.data.get('id')
            if not tin_id:
                raise TBankException.Notification.WrongParams("No 'id' in payload")

            # Пытаемся найти TBankInstallment по order_id=...
            # Если в Forma 'id' == наш order_id, то ищем .aget(order_id=tin_id).
            # Если наоборот — 'external_order_number' = ваш order_id,
            # тогда ищем в data['external_order_number'] =>
            # (зависит от того, как вы настраивали orderNumber).
            # Ниже предполагаем, что 'id' == .order_id:
            try:
                request.payment = await TBankInstallment.objects.select_for_update().aget(
                    order_id=tin_id
                )
            except TBankInstallment.DoesNotExist:
                log.info('[TBankInstallment] Not found TBankInstallment with order_id={tin_id}')
                raise TBankException.Payment.DoesNotExist()

            # Сохраняем поля, которые пришли в webhook, в модель:
            data = request.data
            request.payment.tinkoff_internal_id = data.get('id')
            request.payment.external_order_number = data.get('external_order_number')
            request.payment.status = data.get('status', request.payment.status)
            request.payment.is_demo = bool(data.get('demo', False))
            request.payment.committed = bool(data.get('committed', False))

            # Пример парсинга дат:
            if data.get('created_at'):
                try:
                    request.payment.created_at_tinkoff = dateutil.parser.isoparse(data['created_at'])
                except (ValueError, TypeError) as exc:
                    log.warning('Failed to parse created_at: %s', exc)
            if data.get('expected_overdue_at'):
                try:
                    request.payment.expected_overdue_at = dateutil.parser.isoparse(data['expected_overdue_at'])
                except (ValueError, TypeError) as exc:
                    log.warning('Failed to parse expected_overdue_at: %s', exc)

            # numeric fields
            if data.get('term'): request.payment.term = data['term']
            if data.get('monthly_payment'): request.payment.monthly_payment = data['monthly_payment']
            if data.get('order_amount'): request.payment.order_amount = data['order_amount']
            if data.get('credit_amount'): request.payment.credit_amount = data['credit_amount']
            if data.get('transfer_amount'): request.payment.transfer_amount = data['transfer_amount']
            if data.get('first_payment'): request.payment.first_payment = data['first_payment']

            # text fields
            request.payment.first_name = data.get('first_name')
            request.payment.last_name = data.get('last_name')
            request.payment.middle_name = data.get('middle_name')
            request.payment.phone = data.get('phone')
            request.payment.loan_number = data.get('loan_number')
            request.payment.email = data.get('email')
            request.payment.signing_type = data.get('signing_type')
            request.payment.chosen_bank = data.get('chosen_bank', request.payment.chosen_bank)

            # JSON fields
            if 'items' in data: request.payment.items_data = data['items']
            if 'appropriate_signing_types' in data:
                request.payment.appropriate_signing_types = data['appropriate_signing_types']

            await request.payment.asave()

            # Найдём Order по payment_id
            # (как у вас в async_tbank_payment_notification)
            try:
                order: Order = await Order.objects.select_for_update().aget(
                    payment_id=request.payment.id
                )
                request.order = await order.aget_real_instance()
            except Order.DoesNotExist:
                log.critical(f'[TBankInstallment] Payment {request.payment.id} found, but no Order linked!')
                raise TBankException.Payment.DoesNotExist()

            log.info('[TBankInstallment] Stage #2 - decorator success')
            return await view_func(request, *args, **kwargs)

        except APIException as e:
            renderer = JSONRenderer()
            response = Response(data=e.detail, status=e.status_code)
            log.critical(f'API Exception: {str(e.detail)}')
            response.accepted_renderer = renderer
            response.accepted_media_type = renderer.media_type
            response.renderer_context = {'request': request}
            return response
        except Exception as e:
            request.critical_error = traceback_str(e)
            log.critical(f'[TBankInstallment] Notification Error: {request.critical_error}')
            return await view_func(request, *args, **kwargs)

    return _wrapped_view
