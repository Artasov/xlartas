# software/serializers/wireless.py
from adjango.aserializers import AModelSerializer

from apps.software.models.wireless import WirelessMacro


class WirelessMacroSerializer(AModelSerializer):
    class Meta:
        model = WirelessMacro
        fields = ('id', 'name', 'priority')
        read_only_fields = ('id',)
