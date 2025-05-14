# commerce/factories/other.py
from attr import Factory

from apps.commerce.models.client import Client


class ClientFactory(Factory):
    model = Client

    @classmethod
    async def acreate(cls, user=None, **kwargs):
        """
        Создание клиента с пользователем.
        """
        # if user is None: user = await UserFactory.acreate() # TODO не верно
        return await super().acreate(user=user, **kwargs)
