# tbank/serializers.py
from apps.cloudpayments.models import CloudPaymentPayment
from apps.commerce.serializers.payment import BasePaymentSerializer


class CloudPaymentSmallPublicSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = CloudPaymentPayment
        fields = BasePaymentSerializer.Meta.fields + (
            'status',
            'transaction_id'
        )
