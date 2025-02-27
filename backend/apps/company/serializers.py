# company/serializers.py
from adjango.aserializers import AModelSerializer
from rest_framework.fields import SerializerMethodField

from .models import Company, CompanyDocument


class CompanyDocumentSerializer(AModelSerializer):
    file_url = SerializerMethodField()

    class Meta:
        model = CompanyDocument
        fields = (
            'id', 'title',
            'file_url', 'content',
            'is_public', 'created_at', 'updated_at'
        )

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return None


class CompanySerializer(AModelSerializer):
    documents = CompanyDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = (
            'id', 'name', 'address', 'person_name',
            'bik', 'current_account', 'inn',
            'created_at', 'updated_at', 'documents',
            'resource_url', 'ogrn', 'checking_account',
        )
