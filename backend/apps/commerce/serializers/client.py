# commerce/serializers/client.py
from adjango.aserializers import AModelSerializer

from apps.commerce.models import Client
from apps.core.serializers.user.base import UserPublicSerializer


class ClientPublicSerializer(AModelSerializer):
    user = UserPublicSerializer()

    class Meta:
        model = Client
        fields = ('id', 'user', 'about_me')


class ClientUpdateSerializer(AModelSerializer):
    class Meta:
        model = Client
        fields = ('about_me',)
