from adjango.aserializers import AModelSerializer, ASerializer
from rest_framework import serializers

from apps.core.models.user import User


class UserUsernameSerializer(ASerializer):
    username = serializers.CharField(min_length=2)


class CurrentUserSerializer(AModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'avatar', 'is_staff', 'balance', 'email', 'secret_key')


class SignUpSerializer(ASerializer):
    username = serializers.CharField(required=True, )
    email = serializers.EmailField(required=True, )
    password = serializers.CharField(required=True, )
