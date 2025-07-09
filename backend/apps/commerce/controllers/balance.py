from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.commerce.models import BalanceProduct
from apps.commerce.serializers.balance import BalanceProductSerializer
from apps.core.models import User


@acontroller('Get user balance')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def user_balance(request):
    user: User = request.user
    return Response({'balance': float(user.balance)}, status=HTTP_200_OK)


@acontroller('Get latest balance product')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_latest_balance_product(_request):
    try:
        product = await BalanceProduct.objects.alatest('id')
    except BalanceProduct.DoesNotExist:
        return Response(None)
    return Response(await BalanceProductSerializer(product).adata)
