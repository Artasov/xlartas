# commerce/serializers/payment.py
from adjango.aserializers import AModelSerializer
from rest_framework.fields import SerializerMethodField, DecimalField

from apps.commerce.models.payment import Payment, ShopozzPayment, ProdamusPayment


class BasePaymentSerializer(AModelSerializer):
    polymorphic_ctype = SerializerMethodField()

    class Meta:
        model = Payment
        fields = ('id', 'amount', 'currency', 'payment_url', 'created_at', 'polymorphic_ctype')

    @staticmethod
    def get_polymorphic_ctype(obj):
        content_type = obj.polymorphic_ctype
        if content_type:
            return {
                'id': content_type.id,
                'model': content_type.model,  # e.g., 'tbankpayment'
                'app_label': content_type.app_label,  # e.g., 'tbank'
                'name': content_type.name,  # e.g., 'tbank payment'
            }
        return None

