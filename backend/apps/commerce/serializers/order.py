# commerce/serializers/order.py
from adjango.aserializers import AModelSerializer
from rest_framework.fields import SerializerMethodField

from apps.ckassa.models import CKassaPayment
from apps.ckassa.serializers import CKassaPaymentSmallPublicSerializer
from apps.cloudpayments.models import CloudPaymentPayment
from apps.cloudpayments.serializers import CloudPaymentSmallPublicSerializer
from apps.commerce.models import Order, HandMadePayment, BalancePayment
from apps.commerce.serializers.order_registry import RegisterOrderSerializerMeta
from apps.commerce.serializers.payment import BasePaymentSerializer
from apps.commerce.serializers.promocode import PromocodeSerializer
from apps.freekassa.models import FreeKassaPayment
from apps.freekassa.serializers import FreeKassaPaymentSmallPublicSerializer
from apps.tbank.models import TBankPayment, TBankInstallment
from apps.tbank.serializers import TBankPaymentSerializer, TBankInstallmentSmallPublicSerializer


class HandMadePaymentSmallPublicSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = HandMadePayment
        fields = BasePaymentSerializer.Meta.fields


class BalancePaymentSmallPublicSerializer(BasePaymentSerializer):
    class Meta(BasePaymentSerializer.Meta):
        model = BalancePayment
        fields = BasePaymentSerializer.Meta.fields


class BaseOrderSerializer(AModelSerializer, metaclass=RegisterOrderSerializerMeta):
    payment = SerializerMethodField()
    promocode = PromocodeSerializer(read_only=True)

    # polymorphic_ctype = SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'amount',
            'payment',
            'currency',
            'payment_system',
            'promocode',
            'created_at', 'updated_at',
            'is_inited', 'is_paid', 'is_executed', 'is_cancelled', 'is_refunded',
            # 'polymorphic_ctype',
        )

    @staticmethod
    def get_payment(obj):
        payment = obj.payment if hasattr(obj, 'payment_id') else None
        if payment:
            if isinstance(payment, TBankPayment):
                return TBankPaymentSerializer(payment).data
            if isinstance(payment, TBankInstallment):
                return TBankInstallmentSmallPublicSerializer(payment).data
            if isinstance(payment, CloudPaymentPayment):
                return CloudPaymentSmallPublicSerializer(payment).data
            if isinstance(payment, HandMadePayment):
                return HandMadePaymentSmallPublicSerializer(payment).data
            if isinstance(payment, FreeKassaPayment):
                return FreeKassaPaymentSmallPublicSerializer(payment).data
            if isinstance(payment, CKassaPayment):
                return CKassaPaymentSmallPublicSerializer(payment).data
            if isinstance(payment, BalancePayment):
                return BalancePaymentSmallPublicSerializer(payment).data
            else:
                raise TypeError('Unknown payment type')
        return None

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
        return None
