# commerce/serializers/promocode.py
from adjango.aserializers import AModelSerializer, ASerializer
from rest_framework.fields import CharField, ChoiceField
from rest_framework.relations import PrimaryKeyRelatedField

from apps.commerce.exceptions.promocode import PromocodeException
from apps.commerce.models import Product, Promocode, PromocodeProductDiscount, Currency


class PromocodeProductDiscountSerializer(AModelSerializer):
    class Meta:
        model = PromocodeProductDiscount
        fields = (
            'product',
            'max_usage',
            'max_usage_per_user',
            'interval_days',
            'currency',
            'amount',
        )


class PromocodeSerializer(AModelSerializer):
    discounts = PromocodeProductDiscountSerializer(many=True, read_only=True)

    class Meta:
        model = Promocode
        fields = (
            'id', 'name', 'code', 'description',
            'discounts', 'discount_type',
            'start_date', 'end_date',
            'created_at', 'updated_at',
        )


class PromocodeCheckSerializer(ASerializer):
    promocode = CharField(required=True)
    product = PrimaryKeyRelatedField(
        queryset=Product.objects.all(), required=True)
    currency = ChoiceField(choices=Currency.choices, required=True)

    @staticmethod
    def validate_promocode(code):
        from apps.commerce.models import Promocode
        try:
            promocode = Promocode.objects.get(code=code)
        except Promocode.DoesNotExist:
            raise PromocodeException.ApiEx.DoesNotExist()
        return promocode
