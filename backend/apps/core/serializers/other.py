from adjango.aserializers import AModelSerializer

from apps.core.models.common import Theme


class ThemeSerializer(AModelSerializer):
    class Meta:
        model = Theme
        fields = '__all__'
