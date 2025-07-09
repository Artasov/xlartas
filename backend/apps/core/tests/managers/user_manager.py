# core/tests/managers/user_manager.py
import pytest

from apps.core.models import User


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_user_by_creds():
    user = await User.objects.acreate(
        username='testuser',
        email='test@example.com',
        phone='+71234567890',
    )

    email_user = await User.objects.aby_creds(credential=user.email)
    phone_user = await User.objects.aby_creds(credential=str(user.phone))

    assert email_user == user
    assert phone_user == user
