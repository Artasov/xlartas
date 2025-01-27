# uuid6/field.py
import uuid6
from django.db import models


class UUIDv6Field(models.UUIDField):
    """
    Field for storing UUIDv6 in Django models.
    """

    def __init__(self, *args, **kwargs):
        kwargs['default'] = uuid6.uuid6
        kwargs['editable'] = False
        super().__init__(*args, **kwargs)

    def get_prep_value(self, value):
        if isinstance(value, uuid6.UUID):
            return str(value)
        return super().get_prep_value(value)

    @staticmethod
    def from_db_value(value, expression, connection):
        if value is None:
            return value
        if isinstance(value, uuid6.UUID):
            return value
        return uuid6.UUID(str(value))
