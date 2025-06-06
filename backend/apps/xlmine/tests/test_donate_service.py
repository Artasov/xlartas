import pytest
from decimal import Decimal

from apps.core.models import User
from apps.xlmine.models import Donate, DonateOrder, UserXLMine
from apps.commerce.models.payment import Currency, PaymentSystem

@pytest.mark.django_db
@pytest.mark.asyncio
async def test_postgive_adds_coins_and_profile_created():
    user = await User.objects.acreate(username="don")
    donate = await Donate.objects.acreate(name="Donate", is_available=True)

    order = await DonateOrder.objects.acreate(
        user=user,
        product=donate,
        currency=Currency.RUB,
        payment_system=PaymentSystem.HandMade,
    )

    await donate.pregive(order)
    await donate.postgive(order)

    xlm_user = await UserXLMine.objects.aget(user=user)
    assert xlm_user.coins == Decimal("0")

    await donate.postgive(order)
    await xlm_user.arefresh_from_db()
    assert xlm_user.coins >= Decimal("0")
