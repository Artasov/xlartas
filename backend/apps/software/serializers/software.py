from adjango.aserializers import AModelSerializer

from apps.commerce.serializers.order import BaseOrderSerializer
from apps.commerce.serializers.product import BaseProductSerializer
from apps.software.models import Software, SoftwareOrder, SoftwareLicense, SoftwareProduct


class SoftwareSerializer(AModelSerializer):
    """
    Обычный сериалайзер для самого Software (не Product).
    Можно показывать при выводе карточки программы.
    """

    class Meta:
        model = Software
        fields = '__all__'


class SoftwareProductSerializer(BaseProductSerializer):
    """
    Так как SoftwareProduct наследуется от Product,
    имеет общие поля (name, description, prices и т.п.).
    Добавим наши поля.
    """
    software = SoftwareSerializer(read_only=True)

    class Meta(BaseProductSerializer.Meta):
        model = SoftwareProduct
        fields = BaseProductSerializer.Meta.fields + ('software', 'license_hours',)


class SoftwareOrderSmallSerializer(BaseOrderSerializer):
    class Meta(BaseOrderSerializer.Meta):
        model = SoftwareOrder
        fields = BaseOrderSerializer.Meta.fields + ('product',)


class SoftwareOrderFullSerializer(BaseOrderSerializer):
    product = SoftwareProductSerializer(read_only=True)

    class Meta(BaseOrderSerializer.Meta):
        model = SoftwareOrder
        fields = BaseOrderSerializer.Meta.fields + ('product',)


class SoftwareLicenseSerializer(AModelSerializer):
    software = SoftwareSerializer(read_only=True)

    class Meta:
        model = SoftwareLicense
        fields = '__all__'
