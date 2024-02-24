import json

from django import forms
from django.core.exceptions import ValidationError

from apps.harmony.forms.fields.widgets import DegreesWidget


class DegreesField(forms.CharField):
    widget = DegreesWidget

    def to_python(self, value):
        if not value:
            return []

        # Преобразуем строку, разделенную пробелами, в список чисел
        try:
            degrees_list = [int(item) for item in value.split()]
        except ValueError:
            raise ValidationError("All values should be integers between 1 and 8.")

        # Проверяем каждое значение на допустимый диапазон и уникальность
        for degree in degrees_list:
            if degree < 1 or degree > 8:
                raise ValidationError("All values should be integers between 1 and 8.")
            if degrees_list.count(degree) > 1:
                raise ValidationError(f"Duplicate value: {degree}")

        if len(degrees_list) > 8:
            raise ValidationError("There should be no more than 8 numbers.")

        return degrees_list

    def prepare_value(self, value):
        # Если значение уже является списком, возвращаем его как есть
        if isinstance(value, list):
            return value
        # Если это строка, пытаемся декодировать JSON
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return []

    def validate(self, value):
        super().validate(value)

    def run_validators(self, value):
        super().run_validators(value)
