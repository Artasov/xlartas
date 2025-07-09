# software/tests/test_services.py
from datetime import timedelta

import pytest
from django.utils import timezone
from decimal import Decimal

from apps.commerce.models.payment import Currency, PaymentSystem
from apps.commerce.models.product import ProductPrice
from apps.core.models import User
from apps.software.models import Software, SoftwareOrder, SoftwareLicense
from apps.software.services.license import SoftwareLicenseService


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_postgive_creates_license_and_extends():
    user = await User.objects.acreate(username='u1')
    software = await Software.objects.acreate(name='Soft', min_license_order_hours=1)
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
    user = await User.objects.acreate(username='u2')
    software = await Software.objects.acreate(name='Soft2', min_license_order_hours=5)
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


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_receipt_price_uses_license_hours():
    user = await User.objects.acreate(username='u3')
    software = await Software.objects.acreate(name='Soft3', min_license_order_hours=1)
    price = await ProductPrice.objects.acreate(
        product=software,
        amount=10,
        exponent=2,
        offset=5,
        currency=Currency.RUB,
    )
    order = await SoftwareOrder.objects.acreate(
        user=user,
        product=software,
        currency=Currency.RUB,
        payment_system=PaymentSystem.HandMade,
        license_hours=3,
    )

    expected = Decimal(
        str(
            SoftwareLicenseService.calculate_price(
                hours=3,
                amount=float(price.amount),
                exponent=float(price.exponent or 1.0),
                offset=float(price.offset or 0.0),
            )
        )
    )

    assert await order.receipt_price == expected
