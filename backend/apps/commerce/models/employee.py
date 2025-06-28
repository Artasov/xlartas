# commerce/models/employee.py
from adjango.models import AModel, APolymorphicModel
from django.db.models import (
    TextChoices, CharField,
    DateField, FileField, TextField, ForeignKey, CASCADE, BooleanField, DateTimeField
)
from django.utils.translation import gettext_lazy as _

from apps.commerce.managers.employee import get_legal_document_path
from apps.commerce.services.employee import EmployeeService


class LegalInfo(AModel):
    class LegalType(TextChoices):
        SELF_EMPLOYED = 'self_employed', _('Self employed')
        INDIVIDUAL_ENTREPRENEUR = 'individual_entrepreneur', _('Individual entrepreneur')

    document = FileField(verbose_name=_('Legal document'), upload_to=get_legal_document_path, null=True, blank=True)
    legal_type = CharField(
        verbose_name=_('Legal type'), choices=LegalType.choices, max_length=50, null=True, blank=True
    )
    bank_bik = CharField(verbose_name=_('Bank BIK'), max_length=150, null=True, blank=True)
    bank_name = CharField(verbose_name=_('Bank name'), max_length=250, null=True, blank=True)
    corr_account = CharField(verbose_name=_('Correspondent account'), max_length=250, null=True, blank=True)
    balance_account = CharField(verbose_name=_('Settlement account'), max_length=250, null=True, blank=True)
    address = CharField(verbose_name=_('Address'), max_length=250, null=True, blank=True)
    legal_address = CharField(verbose_name=_('Legal address'), max_length=250, null=True, blank=True)
    inn = CharField(verbose_name=_('INN'), help_text='Без пробелов, только цифры', max_length=250, null=True,
                    blank=True)
    ogrn = CharField(verbose_name=_('OGRN'), max_length=250, null=True, blank=True)

    class Meta:
        abstract = True


class Employee(APolymorphicModel, LegalInfo, EmployeeService):
    class Status(TextChoices):
        NEW = 'new', _('New')
        WORKING = 'working', _('Working')
        NOT_WORKING = 'not_working', _('Not Working')

    status = CharField(verbose_name=_('Status'), choices=Status.choices,
                       default=Status.WORKING, max_length=50, db_index=True)
    education = TextField(verbose_name=_('Education'), blank=True, null=True, default=None)
    about_me = TextField(verbose_name=_('About me'), blank=True, null=True, default=None)
    experience_text = TextField(verbose_name=_('Experience'), blank=True, null=True, default=None)
    is_employed = BooleanField(verbose_name=_('Is employed'), default=False, db_index=True)
    experience_start = DateField(verbose_name=_('Experience start date'), db_index=True)
    auto_schedule_renewal = BooleanField(verbose_name=_('Automatic schedule renewal'), default=True)

    class Meta:
        verbose_name = _('Employee')
        verbose_name_plural = _('Employees')


class EmployeeAvailabilityInterval(AModel):
    user = ForeignKey('core.User', CASCADE, 'availability_intervals', verbose_name=_('User'))
    start = DateTimeField(verbose_name=_('Start'), db_index=True)
    end = DateTimeField(verbose_name=_('End'), db_index=True)

    class Meta:
        verbose_name = _('Employee availability Interval')
        verbose_name_plural = _('Employee availability Intervals')

    def __str__(self):
        return f'User:{self.user_id} - ({self.start} - {self.end})'


class EmployeeLeave(AModel):
    class Type(TextChoices):
        SICK = 'sick', _('Sick Leave')
        MATERNITY = 'maternity', _('Maternity Leave')
        UNPAID = 'unpaid', _('Unpaid Leave')

    user = ForeignKey('core.User', CASCADE, 'leaves', verbose_name=_('User'))
    leave_type = CharField(max_length=20, choices=Type.choices, verbose_name=_('Leave type'))
    start = DateField(verbose_name=_('Start date'), db_index=True)
    end = DateField(verbose_name=_('End date'), db_index=True)
    reason = TextField(blank=True, null=True, verbose_name=_('Reason'))

    class Meta:
        verbose_name = _('Leave')
        verbose_name_plural = _('Leaves')

    def __str__(self):
        return f'{self.get_leave_type_display()} ({self.start} - {self.end})'
