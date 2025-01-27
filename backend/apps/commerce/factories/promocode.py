# commerce/factories/promocode.py
from apps.commerce.models.promocode import Promocode
from apps.core.factories.base import Factory


class PromoCodeFactory(Factory):
    model = Promocode

    @classmethod
    async def acreate(cls, **kwargs):
        """
        Создание промокода.
        """
        return await super().acreate(**kwargs)
