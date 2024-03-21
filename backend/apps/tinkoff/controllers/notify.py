from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.tinkoff.models import TinkoffDepositOrder

log = logging.getLogger('base')


@csrf_exempt
@api_view(('GET', 'POST'))
@permission_classes((AllowAny,))
def notify(request) -> Response:
    log.critical(request.data)
    log.critical(request.data)
    log.critical(request.data)
    log.critical(request.data)
    log.critical(request.data)
    log.critical(request.POST)
    log.critical(request.POST)
    log.critical(request.POST)
    log.critical(request.POST)
    log.critical(request.POST)
    order_id = request.POST.get('OrderId')
    is_paid = request.POST.get('Status') == 'CONFIRMED'
    TinkoffDepositOrder.objects.filter(id=order_id).update(is_paid=is_paid)
    return Response({'success': True})
