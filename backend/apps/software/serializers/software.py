# software/serializers/software.py
from adjango.aserializers import AModelSerializer
from adjango.models import AModel
from django.utils import timezone
from rest_framework.fields import SerializerMethodField

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
        )


class SoftwareOrderSerializer(BaseOrderSerializer):
    product = SoftwareSerializer()

    class Meta(BaseOrderSerializer.Meta):
        model = SoftwareOrder
        fields = BaseOrderSerializer.Meta.fields + (
            'product',
            'license_hours'
        )


class SoftwareLicenseSerializer(AModelSerializer):
    software = SoftwareSerializer()
    remaining_hours = SerializerMethodField()

    class Meta:
        model = SoftwareLicense
        fields = ('id', 'software', 'license_ends_at', 'remaining_hours')

    @staticmethod
    def get_remaining_hours(obj):
        if obj.license_ends_at and obj.license_ends_at > timezone.now():
            delta = obj.license_ends_at - timezone.now()
            return int(delta.total_seconds() // 3600)
        return 0
