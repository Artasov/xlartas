# commerce/serializers/product.py
from adjango.aserializers import AModelSerializer, ASerializer
from rest_framework.fields import SerializerMethodField

from apps.commerce.models import Product


class ProductPriceSerializer(AModelSerializer):
    class Meta:
        from apps.commerce.models.product import ProductPrice
        model = ProductPrice
        fields = '__all__'


class ProductPolymorphicSerializer(ASerializer):
    def to_representation(self, instance):
        pass
        # from apps.commerce.models import GiftCertificate
        # if isinstance(instance, Guide):
        #     serializer = GuideSerializer(instance, context=self.context)
        # elif isinstance(instance, Tariff):
        #     serializer = TariffSerializer(instance, context=self.context)
        # elif isinstance(instance, GiftCertificate):
        #     serializer = GiftCertificateSerializer(instance, context=self.context)
        # elif isinstance(instance, Course):
        #     serializer = CourseSerializer(instance, context=self.context)
        # elif isinstance(instance, Package):
        #     serializer = PackageSerializer(instance, context=self.context)
        # else:
        #     return {'error': 'Invalid product type'}
        # return serializer.data


class BaseProductSerializer(AModelSerializer):
    prices = ProductPriceSerializer(many=True)
    polymorphic_ctype = SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name',
            'is_available',
            'description',
            'prices',
            'polymorphic_ctype',
            'is_installment_available'
        )

    @staticmethod
    def get_polymorphic_ctype(obj):
        content_type = obj.polymorphic_ctype
        if content_type:
            return {
                'id': content_type.id,
                'model': content_type.model,
                'app_label': content_type.app_label,
                'name': content_type.name,
            }
