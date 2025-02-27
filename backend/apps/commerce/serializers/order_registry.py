# commerce/serializers/order_registry.py
from collections import OrderedDict

from apps.commerce.exceptions.order import OrderException
from apps.software.models import SoftwareOrder
from apps.software.serializers import SoftwareOrderSerializer

ORDER_SERIALIZERS = OrderedDict([
    (SoftwareOrder, {
        'small': SoftwareOrderSerializer,
        'full': SoftwareOrderSerializer,
    }),
])


def get_order_serializer(order_instance, serializer_type='small'):
    for order_class, serializers in ORDER_SERIALIZERS.items():
        if isinstance(order_instance, order_class):
            return serializers[serializer_type]
    raise OrderException.UnknownOrderInstance()
