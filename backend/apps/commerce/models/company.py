# commerce/models/company.py
from adjango.models import AModel
from django.db.models import CharField


class CompanyData(AModel):
    param = CharField(max_length=50)
    value = CharField(max_length=200)
