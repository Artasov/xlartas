# core/tests/managers/user_manager.py
import pytest


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_user_by_creds():
    # user = await UserFactory.acreate()
    # email_user = await User.objects.by_creds(credential=user.email)
    # phone_user = await User.objects.by_creds(credential=str(user.phone))
    # assert email_user == user
    # assert phone_user == user
    pass  # TODO не верно
