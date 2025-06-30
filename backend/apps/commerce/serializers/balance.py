from adjango.aserializers import AModelSerializer
from rest_framework.fields import HiddenField, CurrentUserDefault, DecimalField, ChoiceField
from rest_framework.relations import PrimaryKeyRelatedField

from apps.commerce.models import Currency, PaymentSystem, BalanceProduct, BalanceProductOrder
from apps.commerce.serializers.order import BaseOrderSerializer
from apps.commerce.serializers.product import BaseProductSerializer


class BalanceProductSerializer(BaseProductSerializer):
    class Meta(BaseProductSerializer.Meta):
        model = BalanceProduct
        fields = BaseProductSerializer.Meta.fields + ('id', 'name', 'prices')


class BalanceProductOrderCreateSerializer(AModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    product = PrimaryKeyRelatedField(queryset=BalanceProduct.objects.all())
    requested_amount = DecimalField(max_digits=10, decimal_places=2)
    currency = ChoiceField(Currency.choices)
    payment_system = ChoiceField(PaymentSystem.choices)

    class Meta:
        model = BalanceProductOrder
        fields = ('user', 'product', 'currency', 'payment_system', 'requested_amount')


class BalanceProductOrderSerializer(BaseOrderSerializer):
    product = BalanceProductSerializer()

    class Meta(BaseOrderSerializer.Meta):
        model = BalanceProductOrder
        fields = BaseOrderSerializer.Meta.fields + (
            'product', 'requested_amount'
        )
