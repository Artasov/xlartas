from adjango.aserializers import AModelSerializer
from apps.converter.models import Conversion, Format, Parameter
from rest_framework.fields import SerializerMethodField


class FormatSerializer(AModelSerializer):
    class Meta:
        model = Format
        fields = "__all__"


class ParameterSerializer(AModelSerializer):
    options = SerializerMethodField()

    class Meta:
        model = Parameter
        fields = "__all__"

    @staticmethod
    def get_options(obj):
        return [opt.value for opt in obj.options.all()]


class ConversionSerializer(AModelSerializer):
    size = SerializerMethodField()

    class Meta:
        model = Conversion
        fields = "__all__"
        extra_fields = ("size",)

    @staticmethod
    def get_size(obj) -> int | None:
        if obj.output_file:
            try:
                return obj.output_file.size
            except Exception:
                return None
        return None
