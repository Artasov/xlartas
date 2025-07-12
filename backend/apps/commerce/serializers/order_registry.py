# commerce/serializers/order_registry.py
from collections import OrderedDict

from adjango.aserializers import AModelSerializer

from apps.commerce.services.order.exceptions import _OrderException
from apps.commerce.models import Order

ORDER_SERIALIZERS: dict = OrderedDict()


class RegisterOrderSerializerMeta(type(AModelSerializer)):
    """Metaclass that automatically registers order serializers."""

    def __new__(cls, name, bases, attrs):
        cls = super().__new__(cls, name, bases, attrs)
        meta = getattr(cls, 'Meta', None)
        model = getattr(meta, 'model', None)
        if model and model is not Order:
            ORDER_SERIALIZERS.setdefault(model, {})['small'] = cls
            ORDER_SERIALIZERS.setdefault(model, {})['full'] = cls
        return cls


def get_order_serializer(order_instance, serializer_type='small'):
    for order_class, serializers in ORDER_SERIALIZERS.items():
        if isinstance(order_instance, order_class):
            return serializers[serializer_type]
    raise _OrderException.UnknownOrderInstance()
