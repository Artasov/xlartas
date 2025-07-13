# commerce/controllers/balance.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.commerce.serializers.balance import BalanceProductSerializer
from apps.commerce.services.balance import BalanceService


@acontroller('Get user balance')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def user_balance(request):
    return Response({'balance': float(request.user.balance)}, status=HTTP_200_OK)


@acontroller('Get latest balance product')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_latest_balance_product(_):
    product = await BalanceService.actual_balance_product()
    return Response(await BalanceProductSerializer(product).adata if product else Response(None))
