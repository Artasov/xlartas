from _decimal import Decimal, ROUND_HALF_UP

from adjango.adecorators import acontroller
from adjango.aserializers import AModelSerializer
from adrf.decorators import api_view
from django.conf import settings
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.captcha.yandex import captcha_required
from apps.core.exceptions.base import CoreExceptions
from apps.shop.models import BaseOrder
from apps.tinkoff.models import TinkoffDepositOrder


class TinkoffDepositOrderSerializer(AModelSerializer):
    class Meta:
        model = TinkoffDepositOrder
        fields = ('amount',)


@acontroller('Tinkoff pay form')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def tinkoff_pay_form(request) -> HttpResponse:
    amount = request.data.get('amount')
    if amount is None: raise CoreExceptions.SomethingGoWrong()
    order: TinkoffDepositOrder = await TinkoffDepositOrder.objects.acreate(
        user=request.user, amount=amount, type=BaseOrder.OrderTypes.DEPOSIT
    )
    return Response({
        'order_id': order.order_id,
        'amount': order.amount,
    })


@acontroller('Creating a Tinkoff deposit and receiving a payment link')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
@captcha_required
async def create_tinkoff_deposit_order(request) -> Response:
    if not request.is_captcha_valid: raise CoreExceptions.CaptchaInvalid()
    serializer = TinkoffDepositOrderSerializer(data=request.data)
    if serializer.is_valid():
        data = await serializer.adata
        order = await TinkoffDepositOrder.objects.create(
            user=request.user, amount=data.get('amount'), type=BaseOrder.OrderTypes.DEPOSIT
        )
        amount_in_kopecks = (Decimal(order.amount) * 100).quantize(Decimal('1.'), rounding=ROUND_HALF_UP)
        payment_link = f"https://securepay.tinkoff.ru/v2/Init?TerminalKey={settings.TINKOFF_TERMINAL_KEY}&Amount={amount_in_kopecks}&OrderId={order.id}&DATA=Email={request.user.email}"
        return Response({'payment_link': payment_link}, status=status.HTTP_201_CREATED)
    raise CoreExceptions.SomethingGoWrong
