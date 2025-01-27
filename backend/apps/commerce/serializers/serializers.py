# commerce/serializers/serializers.py
from adjango.aserializers import AModelSerializer

from apps.commerce.models.gift_certificate import GiftCertificate
from apps.commerce.serializers.product import ProductPriceSerializer


class GiftCertificateSerializer(AModelSerializer):
    prices = ProductPriceSerializer(many=True)

    class Meta:
        model = GiftCertificate
        fields = '__all__'
