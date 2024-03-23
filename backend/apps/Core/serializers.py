from adrf.serializers import ModelSerializer
from adrf.serializers import Serializer
from rest_framework import serializers

from apps.Core.models.common import Theme
from apps.Core.models.user import User


class ThemeSerializer(ModelSerializer):
    class Meta:
        model = Theme
        fields = ['name', 'bg_image']


class UserUsernameSerializer(Serializer):
    username = serializers.CharField(min_length=2)


class CurrentUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'is_staff', 'balance', 'email', 'secret_key']


class SignUpSerializer(Serializer):
    username = serializers.CharField(required=True, )
    email = serializers.EmailField(required=True, )
    password = serializers.CharField(required=True, )
