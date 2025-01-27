# tbank/serializers.py
from adjango.aserializers import AModelSerializer

from apps.commerce.serializers.payment import BasePaymentSerializer
from apps.commerce.serializers.product import BaseProductSerializer
from apps.tbank.models import TBankPayment, TBankInstallment


class TBankPaymentSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = TBankPayment
        fields = BasePaymentSerializer.Meta.fields + (
            'order_id', 'status', 'source', 'commission',
            # Include other necessary fields
        )


class TBankInstallmentSmallPublicSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = TBankInstallment
        fields = BasePaymentSerializer.Meta.fields + (
            'order_id', 'status',
            # Include other necessary fields
        )


class TBankInstallmentPublicSerializer(AModelSerializer):
    product = BaseProductSerializer()

    class Meta:
        model = TBankInstallment
        fields = '__all__'
