# commerce/controllers/product.py

from adjango.adecorators import acontroller
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.commerce.models import Currency
from apps.commerce.models.payment import CurrencyPaymentSystemMapping, PaymentSystem


@acontroller('Get Payment Types')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def payment_types(_request):
    """
    Возвращает доступные для оплаты на сайте
    валюты и платежные системы для них.
    {
        'EUR': ('Stripe',),
        'RUB': ('TBank',),
        'USD': ('Stripe',)
    }
    """
    # Платежные системы, которые нужно исключить
    exclude_systems = (
        PaymentSystem.Shopozz,
        PaymentSystem.Prodamus,
    )
    currencies = Currency.choices
    payment_systems = {currency: tuple(
        system for system in CurrencyPaymentSystemMapping.get_payment(currency)
        if system not in exclude_systems
    ) for currency, _ in currencies}
    return Response(payment_systems)
