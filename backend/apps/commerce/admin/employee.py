# commerce/admin/employee.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelFilter

from apps.commerce.models.employee import Employee, EmployeeAvailabilityInterval, EmployeeLeave


@admin.register(Employee)
class EmployeeAdmin(ImportExportModelAdmin, PolymorphicParentModelAdmin):
    base_model = Employee
    child_models = ()

    list_display = (
        'get_child',
        'get_subclass',
        'status',
        'is_employed',
        'experience_start',
    )
    search_fields = (
        'status',
        'education',
    )
    list_filter = (
        'status',
        'is_employed',
        PolymorphicChildModelFilter
    )

    @admin.display(description='Type', ordering='polymorphic_ctype')
    def get_subclass(self, obj):
        return obj.get_real_instance().__class__.__name__

    @admin.display(description='Employee', ordering='polymorphic_ctype')
    def get_child(self, obj):
        real = obj.get_real_instance()
        return str(real) if real else '-'


@admin.register(EmployeeAvailabilityInterval)
class EmployeeAvailabilityIntervalAdmin(ImportExportModelAdmin):
    list_display = ('user', 'start', 'end')
    search_fields = (
        'user__username',
        'user__first_name',
        'user__last_name',
        'user__middle_name',

    )


@admin.register(EmployeeLeave)
class EmployeeLeaveAdmin(ImportExportModelAdmin):
    list_display = ('user', 'leave_type', 'start', 'end')
    search_fields = ('user__username', 'leave_type')
    list_filter = ('leave_type', 'start', 'end')
