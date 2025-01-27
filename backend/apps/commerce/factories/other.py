# commerce/factories/other.py
from apps.bitrix24.models import BitrixClient
from apps.commerce.models.client import Client
from apps.core.factories.base import Factory
from apps.core.factories.user import UserFactory


class BitrixClientFactory(Factory):
    model = BitrixClient

    @classmethod
    async def acreate(cls, user=None, **kwargs):
        """
        Создание Bitrix клиента с пользователем.
        """
        if user is None: user = await UserFactory.acreate()
        return await super().acreate(user=user, **kwargs)


class ClientFactory(Factory):
    model = Client

    @classmethod
    async def acreate(cls, user=None, **kwargs):
        """
        Создание клиента с пользователем.
        """
        if user is None: user = await UserFactory.acreate()
        return await super().acreate(user=user, **kwargs)
