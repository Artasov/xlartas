# company/models.py
from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtMixin
from django.db import models
from django.db.models import CharField, URLField, ForeignKey, FileField, TextField, BooleanField
from django.utils.translation import gettext_lazy as _

from apps.company.exceptions import CompanyDocumentException, CompanyException


class Company(ACreatedUpdatedAtMixin, CompanyException):
    name = CharField(_('Name'), max_length=255)
    person_name = CharField(_('Person Name'), max_length=255, null=True, blank=True)
    address = CharField(_('Address'), max_length=500)
    resource_url = URLField(_('Resource url'), blank=True, null=True)
    ogrn = CharField(_('ОГРН'), max_length=15, unique=True)
    inn = CharField(_('ИНН'), max_length=12, unique=True)
    bik = CharField(_('БИК банка'), max_length=9)
    current_account = CharField(_('Корреспондентский счет'), max_length=20)
    checking_account = CharField(_('Расчетный счет'), max_length=20)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Company")
        verbose_name_plural = _("Company")


class CompanyDocument(ACreatedUpdatedAtMixin, CompanyDocumentException):
    company = ForeignKey(Company, verbose_name=_('Company'), on_delete=models.CASCADE, related_name='documents')
    title = CharField(_('Title'), max_length=255)
    file = FileField(_('File'), upload_to='company_documents/', blank=True, null=True)
    content = TextField(_('Content (Markdown)'), blank=True, null=True)
    is_public = BooleanField(_('Is public'), default=False)

    def __str__(self):
        return f"{self.company.name} - {self.title}"

    class Meta:
        verbose_name = 'Company document'
        verbose_name_plural = 'Companies documents'
