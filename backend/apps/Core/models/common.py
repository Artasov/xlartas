from django.db.models import (
    ImageField, CharField, Model, FileField
)


class Theme(Model):
    name = CharField(max_length=100)
    bg_image = ImageField(upload_to='images/theme/background/')


class File(Model):
    name = CharField(max_length=50)
    file = FileField(upload_to='files/', blank=True)

    def __str__(self):
        return f'{self.name}'


class CompanyData(Model):
    param = CharField(max_length=50)
    value = CharField(max_length=200)
