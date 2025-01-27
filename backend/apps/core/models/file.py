# core/models/file.py
from adjango.models import AModel
from django.db.models import CharField, FileField


class File(AModel):
    name = CharField(max_length=50)
    file = FileField(upload_to='files/', blank=True)

    def __str__(self):
        return f'{self.name}'
