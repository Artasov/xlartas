# commerce/serializers/order_registry.py
from collections import OrderedDict

from apps.commerce.exceptions.order import OrderException
from apps.commerce.models import GiftCertificateOrder

ORDER_SERIALIZERS = OrderedDict([
    # (PackageOrder, {
    #     'small': PackageOrderSmallSerializer,
    #     'full': PackageOrderSerializer,
    # }),
    # (CourseOrder, {
    #     'small': CourseOrderSmallSerializer,
    #     'full': CourseOrderSerializer,
    # }),
    # (GuideOrder, {
    #     'small': GuideOrderSmallSerializer,
    #     'full': GuideOrderSerializer,
    # }),
    # (TariffOrder, {
    #     'small': TariffOrderSmallSerializer,
    #     'full': TariffOrderSerializer,
    # }),
    (GiftCertificateOrder, {
        # 'small': GiftCertificateOrderSmallSerializer,
        # 'full': GiftCertificateOrderSerializer,
    }),
])


def get_order_serializer(order_instance, serializer_type='small'):
    for order_class, serializers in ORDER_SERIALIZERS.items():
        if isinstance(order_instance, order_class):
            return serializers[serializer_type]
    raise OrderException.UnknownOrderInstance()
