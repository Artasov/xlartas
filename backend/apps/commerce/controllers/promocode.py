# commerce/controllers/promocode.py

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.commerce.serializers.promocode import (
    PromocodeCheckSerializer, PromocodeSerializer
)


@acontroller('Check Promocode Availability')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def is_promocode_applicable(request):
    s = PromocodeCheckSerializer(data=request.data)
    await s.ais_valid(raise_exception=True)
    promocode = s.validated_data['promocode']
    product = s.validated_data['product']
    currency = s.validated_data['currency']
    await promocode.is_applicable_for(
        user=request.user,
        product=product,
        currency=currency,
        raise_exception=True,
    )
    return Response(await PromocodeSerializer(
        promocode
    ).adata, HTTP_200_OK)
