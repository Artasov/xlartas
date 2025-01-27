# theme/serializers/serializers.py
from adjango.aserializers import AModelSerializer

from apps.theme.models import Theme


class ThemeSerializer(AModelSerializer):
    class Meta:
        model = Theme
        fields = '__all__'
