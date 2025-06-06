import pytest
from django.utils import timezone
from datetime import timedelta

from apps.core.models import User
from apps.software.models import Software, SoftwareOrder, SoftwareLicense
from apps.commerce.models.product import ProductPrice
from apps.commerce.models.payment import Currency, PaymentSystem

@pytest.mark.django_db
@pytest.mark.asyncio
async def test_postgive_creates_license_and_extends():
    user = await User.objects.acreate(username="u1")
    software = await Software.objects.acreate(name="Soft", min_license_order_hours=1)
    await ProductPrice.objects.acreate(product=software, amount=10, currency=Currency.RUB)

    order = await SoftwareOrder.objects.acreate(
        user=user,
        product=software,
        currency=Currency.RUB,
        payment_system=PaymentSystem.HandMade,
        license_hours=2,
    )

    await software.postgive(order)
    license_obj = await SoftwareLicense.objects.aget(user=user, software=software)
    assert license_obj.license_ends_at is not None
    assert abs((license_obj.license_ends_at - timezone.now()) - timedelta(hours=2)) < timedelta(seconds=5)

    prev_end = license_obj.license_ends_at
    order2 = await SoftwareOrder.objects.acreate(
        user=user,
        product=software,
        currency=Currency.RUB,
        payment_system=PaymentSystem.HandMade,
        license_hours=3,
    )
    await software.postgive(order2)
    await license_obj.arefresh_from_db()
    assert abs((license_obj.license_ends_at - prev_end) - timedelta(hours=3)) < timedelta(seconds=5)

@pytest.mark.django_db
@pytest.mark.asyncio
async def test_can_pregive_checks():
    user = await User.objects.acreate(username="u2")
    software = await Software.objects.acreate(name="Soft2", min_license_order_hours=5)
    await ProductPrice.objects.acreate(product=software, amount=10, currency=Currency.RUB)
    order = await SoftwareOrder.objects.acreate(
        user=user,
        product=software,
        currency=Currency.RUB,
        payment_system=PaymentSystem.HandMade,
        license_hours=4,
    )
    assert await software.can_pregive(order) is False
    with pytest.raises(Exception):
        await software.can_pregive(order, raise_exceptions=True)

    order.license_hours = 6
    assert await software.can_pregive(order) is True
