# filehost/serializers.py
from adjango.aserializers import AModelSerializer
from rest_framework.fields import SerializerMethodField

from apps.filehost.models import Folder, File, Tag, FileTag, FolderTag, Access


class FolderSerializer(AModelSerializer):
    class Meta:
        model = Folder
        fields = '__all__'


class FileSerializer(AModelSerializer):
    size = SerializerMethodField()

    class Meta:
        model = File
        fields = '__all__'

    @staticmethod
    def get_size(obj):
        return obj.file.size if obj.file else None


class AccessSerializer(AModelSerializer):
    class Meta:
        model = Access
        fields = '__all__'


class ATagSerializer(AModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class TagSerializer(AModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class FileTagSerializer(AModelSerializer):
    class Meta:
        model = FileTag
        fields = '__all__'


class FolderTagSerializer(AModelSerializer):
    class Meta:
        model = FolderTag
        fields = '__all__'
