from apps.ckassa.models import CKassaPayment
from apps.commerce.serializers.payment import BasePaymentSerializer


class CKassaPaymentSmallPublicSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = CKassaPayment
        fields = BasePaymentSerializer.Meta.fields + (
            'reg_pay_num',
            'status',
        )
