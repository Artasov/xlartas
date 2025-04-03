# xlmine/serializers/donate.py

from apps.commerce.serializers.order import BaseOrderSerializer
from apps.commerce.serializers.product import BaseProductSerializer
from apps.xlmine.models import DonateOrder, DonateProduct


class DonateProductSerializer(BaseProductSerializer):
    class Meta(BaseProductSerializer.Meta):
        model = DonateProduct
        fields = BaseProductSerializer.Meta.fields


class DonateOrderCreateSerializer(BaseOrderSerializer):
    class Meta(BaseOrderSerializer.Meta):
        model = DonateOrder
        fields = BaseOrderSerializer.Meta.fields + (
            'user', 'product', 'currency', 'payment_system', 'promocode'
        )

    async def asave(self, **kwargs) -> DonateOrder:
        return await super().asave(**kwargs)
