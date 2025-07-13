# freekassa/serializers.py
from apps.commerce.serializers.payment import BasePaymentSerializer
from apps.freekassa.models import FreeKassaPayment


class FreeKassaPaymentSmallPublicSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = FreeKassaPayment
        fields = BasePaymentSerializer.Meta.fields + (
            'fk_order_id',
            'order_hash',
            'status',
        )
