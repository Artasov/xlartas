# commerce/serializers/order_registry.py
from collections import OrderedDict

from apps.commerce.exceptions.order import OrderException


ORDER_SERIALIZERS: dict = OrderedDict()


class RegisterOrderSerializerMeta(type):
    """Metaclass that automatically registers order serializers."""

    def __new__(mcls, name, bases, attrs):
        cls = super().__new__(mcls, name, bases, attrs)
        meta = attrs.get('Meta')
        model = getattr(meta, 'model', None)
        if model:
            ORDER_SERIALIZERS.setdefault(model, {})['small'] = cls
            ORDER_SERIALIZERS.setdefault(model, {})['full'] = cls
        return cls


def get_order_serializer(order_instance, serializer_type='small'):
    for order_class, serializers in ORDER_SERIALIZERS.items():
        if isinstance(order_instance, order_class):
            return serializers[serializer_type]
    raise OrderException.UnknownOrderInstance()
