# commerce/controllers/tbank/installment_notification.py

import logging

from adjango.adecorators import acontroller, aatomic, aforce_data
from adrf.decorators import api_view
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.commerce.services.order.exceptions import _OrderException
from apps.tbank.decorators.installment import async_tbank_installment_notification

log = logging.getLogger('commerce')


@acontroller('TBankInstallment Notification', 'global')
@aatomic
@api_view(('POST', 'GET'))
@permission_classes((AllowAny,))
@aforce_data
@async_tbank_installment_notification
async def installment_notification(request):
    log.info('Stage #10 (Installment)')

    # Если в декораторе словили ошибку
    if request.critical_error:
        log.info('Stage #11 (Installment) => critical_error')
        if request.method == 'GET':
            log.info(f'Stage #12 (Installment) => redirect with {request.critical_error}')
            return redirect(f'{settings.DOMAIN_URL}/orders/?error_message=Рассрочка не прошла. #XYZ')
        return Response(status=HTTP_400_BAD_REQUEST)

    # У нас уже есть request.payment (TBankInstallment), request.order
    installment = request.payment
    order = getattr(request, 'order', None)
    if not order:
        log.info('Stage #13 (Installment) => no linked order?!')
        return Response(status=HTTP_400_BAD_REQUEST)

    # Статус (signed, approved, canceled, etc.) уже записан
    # в is_installment_available.status, но мы можем взять из request.data['status'] тоже
    current_status = installment.status
    log.info(f'Stage #14 (Installment) => status={current_status}, order_id={order.id}, pmt={installment.id}')

    # Логика, похожая на ваш notification:
    if current_status in ('signed', 'approved'):
        log.info('Stage #15 (Installment) => mark is_paid')
        order.is_paid = True
        installment.is_paid = True
        await order.asave()
        await installment.asave()

        try:
            log.info('Stage #16 (Installment) => order.execute()')
            await order.execute()
        except _OrderException.AlreadyExecuted:
            log.info('Stage #17 (Installment) => AlreadyExecuted pass')

        # Если GET, редиректим на success
        if request.method == 'GET':
            log.info('Stage #18 (Installment) => success redirect')
            return redirect(f'{settings.DOMAIN_URL}/orders/?success_message=Заказ успешно оформлен в рассрочку!')

        log.info('Stage #19 (Installment) => return 200')
        return Response(status=HTTP_200_OK)

    elif current_status in ('canceled', 'rejected'):
        log.info('Stage #20 (Installment) => canceled or rejected')
        # Можете отмечать order.is_cancelled = True
        # или просто вернуть 200
        return Response(status=HTTP_200_OK)

    # Если дошли сюда => не подошёл статус
    log.info('Stage #21 (Installment) => status not recognized? Return 200 anyway')
    return Response(status=HTTP_200_OK)
