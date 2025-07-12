# commerce/serializers/gift_certificate.py
from adjango.aserializers import AModelSerializer
from rest_framework.fields import CurrentUserDefault, HiddenField, SerializerMethodField
from rest_framework.relations import PrimaryKeyRelatedField

from apps.commerce.models import GiftCertificateOrder, Promocode
from apps.commerce.models.gift_certificate import GiftCertificate
from apps.commerce.serializers.order import BaseOrderSerializer
from apps.commerce.serializers.product import BaseProductSerializer


class GiftCertificateSerializer(BaseProductSerializer):
    product = BaseProductSerializer()

    class Meta(BaseProductSerializer.Meta):
        model = GiftCertificate
        fields = BaseProductSerializer.Meta.fields + ('product',)


class GiftCertificateOrderCreateSerializer(AModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    product = PrimaryKeyRelatedField(queryset=GiftCertificate.objects.all())
    promocode = PrimaryKeyRelatedField(queryset=Promocode.objects.all(), required=False, allow_null=True)

    class Meta:
        model = GiftCertificateOrder
        fields = (
            'user', 'product', 'currency', 'payment_system', 'promocode'
        )


class GiftCertificateOrderSmallSerializer(BaseOrderSerializer):
    product = GiftCertificateSerializer()
    key = SerializerMethodField()

    class Meta(BaseOrderSerializer.Meta):
        model = GiftCertificateOrder
        fields = BaseOrderSerializer.Meta.fields + ('product', 'key',)

    @staticmethod
    def get_key(obj):
        return str(obj.key)


class GiftCertificateOrderSerializer(GiftCertificateOrderSmallSerializer):
    class Meta(GiftCertificateOrderSmallSerializer.Meta):
        model = GiftCertificateOrder
        fields = GiftCertificateOrderSmallSerializer.Meta.fields
