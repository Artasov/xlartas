# uuid6/serializers.py
from json import JSONEncoder

import uuid6
from rest_framework.fields import Field


class UUIDEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid6.UUID):
            return str(obj)
        return super().default(obj)


class UUIDv6Serializer(Field):
    def to_representation(self, value):
        return str(value)

    def to_internal_value(self, data):
        return uuid6.UUID(data)
