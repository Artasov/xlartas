# commerce/serializers/product.py
from adjango.aserializers import AModelSerializer
from rest_framework.fields import SerializerMethodField

from apps.commerce.models import Product


class ProductPriceSerializer(AModelSerializer):
    class Meta:
        from apps.commerce.models.product import ProductPrice
        model = ProductPrice
        fields = '__all__'


class BaseProductSerializer(AModelSerializer):
    prices = ProductPriceSerializer(many=True)
    polymorphic_ctype = SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'pic',
            'prices', 'description',
            'is_available', 'short_description',
            'polymorphic_ctype', 'is_installment_available'
        )

    @staticmethod
    def get_polymorphic_ctype(obj):
        print(obj.__dict__)
        print(obj.polymorphic_ctype)
        content_type = obj.polymorphic_ctype
        if content_type:
            return {
                'id': content_type.id,
                'model': content_type.model,
                'app_label': content_type.app_label,
                'name': content_type.name,
            }
