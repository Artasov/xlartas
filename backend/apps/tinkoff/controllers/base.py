from _decimal import Decimal, ROUND_HALF_UP
from adrf.decorators import api_view
from adrf.serializers import ModelSerializer
from asgiref.sync import sync_to_async
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render, redirect
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.Core.exceptions.base import SomethingGoWrong
from apps.Core.services.base import acontroller
from apps.tinkoff.models import TinkoffDepositOrder


class TinkoffDepositOrderSerializer(ModelSerializer):
    class Meta:
        model = TinkoffDepositOrder
        fields = ('amount',)


@acontroller('Tinkoff pay form')
@api_view(['POST'])
@permission_classes((IsAuthenticated,))
async def tinkoff_pay_form(request) -> HttpResponse:
    amount = request.data.get('amount')
    if amount is None: raise SomethingGoWrong()
    order: TinkoffDepositOrder = await TinkoffDepositOrder.objects.acreate(
        user=request.user, amount=amount
    )
    return Response({
        'order_id': order.order_id,
        'amount': order.amount,
    })


@acontroller('Creating a Tinkoff deposit and receiving a payment link')
@api_view(['POST'])
@permission_classes((IsAuthenticated,))
async def create_tinkoff_deposit_order(request) -> Response:
    print(request.data)
    serializer = TinkoffDepositOrderSerializer(data=request.data)
    print(serializer)
    if serializer.is_valid():
        data = await serializer.adata
        order = await TinkoffDepositOrder.objects.acreate(user=request.user, amount=data.get('amount'))
        amount_in_kopecks = (Decimal(order.amount) * 100).quantize(Decimal('1.'), rounding=ROUND_HALF_UP)
        payment_link = f"https://securepay.tinkoff.ru/v2/Init?TerminalKey={settings.TINKOFF_TERMINAL_KEY}&Amount={amount_in_kopecks}&OrderId={order.id}&DATA=Email={request.user.email}"
        print(payment_link)
        return Response({'payment_link': payment_link}, status=status.HTTP_201_CREATED)
    raise SomethingGoWrong
