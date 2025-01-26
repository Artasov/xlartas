from adjango.models import AModel
from django.db.models import (
    ImageField, CharField, Model, FileField, TextChoices, BooleanField
)


class Theme(AModel):
    class ThemeMode(TextChoices):
        LIGHT = 'light', 'light'
        DARK = 'dark', 'Dark'

    name = CharField(max_length=100)
    mode = CharField(max_length=10, choices=ThemeMode.choices)
    bg_image = ImageField(upload_to='images/theme/background/', null=True, blank=True)
    is_default = BooleanField(default=False)


class File(AModel):
    name = CharField(max_length=50)
    file = FileField(upload_to='files/', blank=True)

    def __str__(self):
        return f'{self.name}'


class CompanyData(AModel):
    param = CharField(max_length=50)
    value = CharField(max_length=200)
