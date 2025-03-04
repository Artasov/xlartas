# software/serializers/software.py
from adjango.aserializers import AModelSerializer
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.fields import SerializerMethodField, HiddenField, CurrentUserDefault
from rest_framework.relations import PrimaryKeyRelatedField, SlugRelatedField

from apps.commerce.models import Promocode
from apps.commerce.serializers.order import BaseOrderSerializer
from apps.commerce.serializers.product import BaseProductSerializer
from apps.software.models import Software, SoftwareOrder, SoftwareLicense, SoftwareFile


class SoftwareFileSerializer(AModelSerializer):
    class Meta:
        model = SoftwareFile
        fields = (
            'id',
            'file',
            'version',
            'created_at',
        )


class SoftwareSerializer(BaseProductSerializer):
    file = SoftwareFileSerializer()

    class Meta(BaseProductSerializer.Meta):
        model = Software
        fields = BaseProductSerializer.Meta.fields + (
            'log_changes',
            'test_period_days',
            'min_license_order_hours',
            'file',
            'review_url',
            'guide_url',
        )


class SoftwareOrderSerializer(BaseOrderSerializer):
    product = SoftwareSerializer()

    class Meta(BaseOrderSerializer.Meta):
        model = SoftwareOrder
        fields = BaseOrderSerializer.Meta.fields + (
            'product',
            'license_hours'
        )


class SoftwareOrderCreateSerializer(AModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    product = PrimaryKeyRelatedField(queryset=Software.objects.all())
    promocode = SlugRelatedField(
        slug_field='code',
        queryset=Promocode.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = SoftwareOrder
        fields = (
            'user',
            'product',
            'currency',
            'promocode',
            'license_hours',
            'payment_system',
        )

    def validate(self, data):
        license_hours = data.get('license_hours')
        product = data.get('product')
        if not license_hours or int(license_hours) < product.min_license_order_hours:
            raise ValidationError(f'License hours must be >= {product.min_license_order_hours}')
        return data


class SoftwareLicenseSerializer(AModelSerializer):
    software = SoftwareSerializer()
    remaining_hours = SerializerMethodField()

    class Meta:
        model = SoftwareLicense
        fields = ('id', 'software', 'license_ends_at', 'remaining_hours', 'is_tested')

    @staticmethod
    def get_remaining_hours(obj: SoftwareLicense):
        if obj.license_ends_at and obj.license_ends_at > timezone.now():
            delta = obj.license_ends_at - timezone.now()
            return int(delta.total_seconds() // 3600)
        return 0
