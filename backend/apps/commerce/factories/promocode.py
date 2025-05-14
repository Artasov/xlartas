# commerce/factories/promocode.py
from attr import Factory

from apps.commerce.models.promocode import Promocode


class PromoCodeFactory(Factory):
    model = Promocode

    @classmethod
    async def acreate(cls, **kwargs):
        """
        Создание промокода.
        """
        return await super().acreate(**kwargs)
