from rest_framework import serializers

from .models import ResourcePack, ResourcePackImage, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username',)


class ResourcePackImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourcePackImage
        fields = ('image',)


class ResourcePackSerializer(serializers.ModelSerializer):
    image_preview = ResourcePackImageSerializer()
    images = ResourcePackImageSerializer(many=True)
    likes_by = UserSerializer(many=True)
    downloads_by = UserSerializer(many=True)
    uploaded_by = UserSerializer()
    date_created = serializers.DateTimeField(format="%Y-%m-%d", required=False)

    class Meta:
        model = ResourcePack
        fields = '__all__'
