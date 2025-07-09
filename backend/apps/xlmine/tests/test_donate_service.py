# xlmine/tests/test_donate_service.py
from decimal import Decimal

import pytest

from apps.commerce.models.payment import Currency, PaymentSystem
from apps.commerce.models.product import ProductPrice
from apps.core.models import User
from apps.xlmine.models import Donate, DonateOrder, Privilege
from apps.xlmine.models.user import UserXLMine


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_postgive_adds_coins_and_recalculates_privilege():
    user = await User.objects.acreate(username='don')
    donate = await Donate.objects.acreate(name='Donate', is_available=True)
    await ProductPrice.objects.acreate(product=donate, amount=10, currency=Currency.RUB)
    privilege = await Privilege.objects.acreate(
        name='Bronze', code_name='bronze', prefix='[B]', weight=1, threshold=0
    )

    order = await DonateOrder.objects.acreate(
        user=user,
        product=donate,
        currency=Currency.RUB,
        payment_system=PaymentSystem.HandMade,
    )

    await donate.pregive(order)
    await donate.postgive(order)

    xlm_user = await UserXLMine.objects.aget(user=user)
    assert xlm_user.coins == Decimal('10')
    assert xlm_user.privilege_id == privilege.id
