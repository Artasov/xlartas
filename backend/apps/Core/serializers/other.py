from adrf.serializers import ModelSerializer

from apps.Core.models.common import Theme


class ThemeSerializer(ModelSerializer):
    class Meta:
        model = Theme
        fields = ('name', 'bg_image')
