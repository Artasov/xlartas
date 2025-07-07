# commerce/controllers/order.py
import logging

from adjango.adecorators import acontroller
from adjango.aserializers import ASerializer
from adjango.utils.base import AsyncAtomicContextManager
from adrf.decorators import api_view
from django.conf import settings
from rest_framework.decorators import permission_classes
from rest_framework.fields import HiddenField, CurrentUserDefault, ChoiceField, EmailField
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.relations import PrimaryKeyRelatedField
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED

from apps.commerce.exceptions.order import OrderException
from apps.commerce.exceptions.payment import PaymentException
from apps.commerce.models import Order, Currency, Product
from apps.commerce.serializers.order_registry import get_order_serializer
from apps.commerce.services.order.base import OrderService
from apps.core.exceptions.user import UserException
from apps.core.models import User
from apps.software.models import SoftwareOrder
from apps.software.serializers import SoftwareOrderSerializer
from apps.tbank.models import TBankPayment

log = logging.getLogger('global')


@acontroller('Create order')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def create_order(request):
    log.info(f'Create order {request.data}')
    log.info(f'User {request.user}')

    class OrderCreateRequestValidationSerializer(ASerializer):
        user = HiddenField(default=CurrentUserDefault())
        currency = ChoiceField(Currency.choices, required=True, allow_null=True)
        product = PrimaryKeyRelatedField(
            queryset=Product.objects.all(), required=True
        )
        email = EmailField(required=False, default=None, allow_null=True)

    s = OrderCreateRequestValidationSerializer(
        data=request.data, context={'request': request}
    )
    await s.ais_valid(raise_exception=True)

    # Сохранение почты
    if not request.user.email:
        # Так как не сохраняли при регистрации, а чек куда-то выслать нужно
        email = s.validated_data.get('email')
        if not email: raise UserException.EmailWasNotProvided()
        if email and await User.objects.filter(
                email=email
        ).aexists(): raise UserException.AlreadyExistsWithThisEmail()
        request.user.email = email
        await request.user.asave()

    # Создание заказа
    product: Product = await s.validated_data['product'].aget_real_instance()
    async with AsyncAtomicContextManager():
        order = await product.new_order(request=request)  # noqa
        if settings.DEBUG and not settings.DEBUG_INIT_PAYMENT:
            return Response('/something-go-wrong', status=HTTP_201_CREATED)
        if not order.payment:
            return Response({'id': order.id}, status=HTTP_201_CREATED)
        return Response({
            'payment_url': order.payment.payment_url,
            'id': order.id,
        }, status=HTTP_201_CREATED)


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
        await order.execute()  # noqa
    serializer_class = get_order_serializer(order, 'full')
    return Response(await serializer_class(order).adata, status=HTTP_200_OK)


@acontroller('Order Delete')
@api_view(('POST',))
@permission_classes((IsAdminUser,))
async def order_delete(_request, id):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id)
    async with AsyncAtomicContextManager(): await order.adelete()
    return Response(True, status=HTTP_200_OK)


@acontroller('Order Init')
@api_view(('POST',))
@permission_classes((IsAdminUser,))
async def order_init(request, id, init_payment):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id)
    async with AsyncAtomicContextManager():
        await order.init(request, init_payment=bool(init_payment))  # noqa
    serializer_class = get_order_serializer(order, 'full')
    return Response(await serializer_class(order).adata, status=HTTP_200_OK)


@acontroller('Order Cancel')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def order_cancel(request, id):
    order: Order | OrderService = await Order.objects.agetorn(
        OrderException.NotFound, id=id, user=request.user
    )
    async with AsyncAtomicContextManager():
        await order.safe_cancel(request=request, reason='')
        if isinstance(order, SoftwareOrder):
            return Response(await SoftwareOrderSerializer(order).adata, status=HTTP_200_OK)
        raise OrderException.UnknownOrderInstance()


@acontroller('Resend payment notification')
@api_view(('POST',))
@permission_classes((IsAdminUser,))
async def resend_payment_notification(_request, id):
    order: Order = await Order.objects.agetorn(OrderException.NotFound, id=id)
    async with AsyncAtomicContextManager():
        payment = await order.arelated('payment')
        if isinstance(payment, TBankPayment):
            await payment.resend()  # TODO: Unresolved attribute reference 'resend' for class 'TBankPayment'
        else:
            PaymentException.PaymentSystemNotFound()
    return Response(status=HTTP_200_OK)
