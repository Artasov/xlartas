# commerce/controllers/order.py
from adjango.adecorators import acontroller
from adjango.utils.base import AsyncAtomicContextManager
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.commerce.exceptions.order import OrderException
from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.models import Order, GiftCertificateOrder
from apps.commerce.serializers.order_registry import get_order_serializer
from apps.commerce.services.order import IOrderService
from apps.tbank.models import TBankPayment


@acontroller('User Orders')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def user_orders(request):
    data = []
    async for order in Order.objects.filter(user=request.user).order_by('-created_at'):
        serializer_class = get_order_serializer(order, 'small')
        data.append(await serializer_class(order).adata)
    return Response(data, status=HTTP_200_OK)


@acontroller('Order Details')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def order_detail(request, id):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id, user=request.user)
    serializer_class = get_order_serializer(order, 'full')
    return Response(await serializer_class(order).adata, status=HTTP_200_OK)


@acontroller('Order Execute')
@api_view(('POST',))
@permission_classes((IsAdminUser,))
async def order_execute(_request, id):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id)
    async with AsyncAtomicContextManager():
        await order.execute()
    serializer_class = get_order_serializer(order, 'full')
    return Response(await serializer_class(order).adata, status=HTTP_200_OK)


@acontroller('Order Init')
@api_view(('POST',))
@permission_classes((IsAdminUser,))
async def order_init(request, id, init_payment):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id)
    async with AsyncAtomicContextManager():
        await order.init(request, init_payment=bool(init_payment))
    serializer_class = get_order_serializer(order, 'full')
    return Response(await serializer_class(order).adata, status=HTTP_200_OK)


@acontroller('Order Cancel')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def order_cancel(request, id):
    order: Order | IOrderService = await Order.objects.agetorn(
        OrderException.NotFound, id=id, user=request.user
    )
    # async with AsyncAtomicContextManager():
    #     await order.safe_cancel(request=request, reason='')
    #     if isinstance(order, PackageOrder):
    #         return Response(await PackageOrderSerializer(order).adata, status=HTTP_200_OK)
    #     elif isinstance(order, GuideOrder):
    #         return Response(await GuideOrderSerializer(order).adata, status=HTTP_200_OK)
    #     elif isinstance(order, CourseOrder):
    #         return Response(await CourseOrderSerializer(order).adata, status=HTTP_200_OK)
    #     elif isinstance(order, GiftCertificateOrder):
    #         return Response(await GiftCertificateOrderSerializer(order).adata, status=HTTP_200_OK)
    #     elif isinstance(order, TariffOrder):
    #         return Response(await TariffOrderSerializer(order).adata, status=HTTP_200_OK)
    #     raise OrderException.UnknownOrderInstance()


@acontroller('Resend payment notification')
@api_view(('POST',))
@permission_classes((IsAdminUser,))
async def resend_payment_notification(_request, id):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id)
    async with AsyncAtomicContextManager():
        payment = await order.arelated('payment')
        if isinstance(payment, TBankPayment):
            await payment.resend()
        else:
            PaymentException.PaymentSystemNotFound()
    return Response(status=HTTP_200_OK)
