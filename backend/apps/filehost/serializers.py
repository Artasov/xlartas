from adrf.serializers import ModelSerializer as AModelSerializer
from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer

from apps.filehost.models import Folder, File, Tag, FileTag, FolderTag, Access


class AFolderSerializer(AModelSerializer):
    class Meta:
        model = Folder
        fields = '__all__'


class FolderSerializer(ModelSerializer):
    class Meta:
        model = Folder
        fields = '__all__'


class FileSerializer(AModelSerializer):
    size = SerializerMethodField()

    class Meta:
        model = File
        fields = '__all__'

    def get_size(self, obj):
        return obj.file.size if obj.file else None


class AccessSerializer(ModelSerializer):
    class Meta:
        model = Access
        fields = '__all__'


class ATagSerializer(AModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class TagSerializer(ModelSerializer):
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
