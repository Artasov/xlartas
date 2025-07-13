# commerce/controllers/payment.py
from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any, Dict

from adjango.adecorators import acontroller, aatomic
from adrf.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from apps.commerce.models import Order
from apps.commerce.providers.registry import get_provider
from apps.commerce.serializers.payment import BasePaymentSerializer
from apps.commerce.services.order.base import OrderService

log = logging.getLogger('commerce')


@acontroller('Init payment for order')
@aatomic
@api_view(('POST',))
async def init_payment(request, id: str):
    """
    Body → {payment_system: 'tbank'|'cloud_payment'|..., currency: 'RUB', amount: 594.00}
    """
    body: Dict[str, Any] = request.data
    payment_system: str = body.get('payment_system')
    currency: str = body.get('currency')
    amount: Decimal = Decimal(str(body.get('amount', '0')))

    if not payment_system or not currency:
        return Response({'detail': 'payment_system & currency required'}, status=HTTP_400_BAD_REQUEST)

    order: Order = await Order.objects.select_for_update().aget(pk=id)

    if order.is_paid:
        raise OrderService.exceptions.AlreadyPaid()

    if order.payment_id:
        _payment = await order.arelated('payment')
        return Response(await BasePaymentSerializer(order.payment).adata, status=HTTP_200_OK)

    provider = get_provider(payment_system)
    payment = await provider.create(order=order, request=request, amount=amount)

    order.payment = payment
    order.payment_system = payment_system
    order.is_inited = True
    await order.asave()

    return Response(await BasePaymentSerializer(payment).adata, status=HTTP_200_OK)
