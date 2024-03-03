from adrf.decorators import api_view
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.Core.services.services import acontroller
from apps.freekassa.services.freekassa import FreeKassa
from apps.shop.models import UserDeposit


@api_view(['POST'])
@permission_classes([IsAuthenticated])
async def create_deposit(request) -> Response:
    user = request.user
    amount = request.data.get('amount')
    if not amount:
        return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)

    deposit = await UserDeposit.objects.acreate(user=user, amount=amount)

    fk = FreeKassa()
    order_id = str(deposit.id)
    response = await fk.create_order(amount, 'RUB', order_id, email=user.email, ip=request.META.get('REMOTE_ADDR'))
    print(response)
    if response.get('type') == 'success':
        return Response({'payment_url': response.get('location')})
    else:
        return Response({'error': 'Failed to create FreeKassa order'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@acontroller('FreeKassa notification')
async def fk_notify(request) -> Response:
    order_id = request.data.get('MERCHANT_ORDER_ID')
    amount = request.data.get('AMOUNT')
    sign = request.data.get('SIGN')

    fk = FreeKassa()
    calculated_sign = fk.generate_signature({
        'MERCHANT_ID': settings.FK_MERCHANT_ID,
        'AMOUNT': amount,
        'MERCHANT_ORDER_ID': order_id
    }, settings.FK_SECRET_WORD2)
    if sign != calculated_sign:
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    print('!!!!ЗАКАЗ!!!!')

    return Response('YES')


@api_view(['GET'])
@permission_classes([AllowAny])
@acontroller('FreeKassa SUCCESS notification')
async def fk_success(request) -> Response:
    print('Успешная опалата.')
    print(request.data)
    return Response({'message': 'Payment successful'})


@api_view(['GET'])
@permission_classes([AllowAny])
@acontroller('FreeKassa FAILED notification')
async def fk_failed(request) -> Response:
    print('Говно опалата.')
    print(request.data)
    return Response({'message': 'Payment failed'}, status=status.HTTP_400_BAD_REQUEST)
