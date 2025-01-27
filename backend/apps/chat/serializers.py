# chat/serializers.py
import mimetypes

from adjango.aserializers import AModelSerializer
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from rest_framework.relations import PrimaryKeyRelatedField

from .models import Room, Message, File
from ..core.models import User
from ..core.serializers.user.base import UserPublicSerializer


class FileSerializer(AModelSerializer):
    name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'file', 'name', 'type']

    @staticmethod
    def get_name(obj):
        # Возвращает только имя файла без пути
        return obj.file.name.split('/')[-1]

    @staticmethod
    def get_type(obj):
        # Определяет MIME-тип файла на основе его имени
        if obj.file:
            mime_type, _ = mimetypes.guess_type(obj.file.name)
            return mime_type or ''
        return ''


class MessageSerializer(AModelSerializer):
    files = FileSerializer(many=True, read_only=True)
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = (
            'id', 'user',
            'text', 'created_at',
            'files', 'is_read',
            'is_important'
        )


class RoomSerializer(AModelSerializer):
    participants = UserPublicSerializer(many=True, read_only=True)
    last_message = SerializerMethodField()

    class Meta:
        model = Room
        fields = ('id', 'name', 'participants', 'last_message', 'max_participants')

    @staticmethod
    def get_last_message(obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None


class RoomInitSerializer(AModelSerializer):
    participants = PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)

    class Meta:
        model = Room
        fields = ('name', 'participants')
