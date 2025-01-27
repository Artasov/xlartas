# commerce/serializers/availability_interval.py
from adjango.aserializers import AModelSerializer

from apps.commerce.models import EmployeeAvailabilityInterval


class AvailabilityIntervalSerializer(AModelSerializer):
    class Meta:
        model = EmployeeAvailabilityInterval
        fields = ('id', 'user', 'start', 'end')
