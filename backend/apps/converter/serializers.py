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
    class Meta:
        model = Conversion
        fields = "__all__"
