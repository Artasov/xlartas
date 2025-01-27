# core/admin/user.py

from adjango.decorators import admin_description, admin_order_field
from django.contrib import admin
from django.db import transaction
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django_object_actions import DjangoObjectActions
from import_export.admin import ImportExportModelAdmin

from apps.core.models import User

admin.site.site_header = 'xlartas'
admin.site.site_title = 'xlartas'
admin.site.index_title = ''


@admin.register(User)
class UserAdmin(DjangoObjectActions, ImportExportModelAdmin):
    list_display = (
        'id',
        'display_avatar',
        'display_full_name',
        'email',
        'phone',
        'gender',
        'timezone',
        'is_email_confirmed',
        'is_phone_confirmed',
        'is_staff',
        'is_test'
    )
    search_fields = (
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'middle_name',
        'phone',
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    readonly_fields = (
        'display_avatar',
        'display_user_id',
    )
    list_per_page = 20
    list_display_links = ('id', 'display_avatar', 'display_full_name', 'email')

    fieldsets = (
        (_('General info'), {'fields': (
            'display_user_id',
            'display_avatar', 'avatar',
            'username',
            'first_name', 'last_name', 'middle_name',
            'email', 'phone',
            'password',
            'birth_date', 'gender',
            'timezone',
            'is_email_confirmed',
            'is_phone_confirmed',
            'is_test'
        )}),
        (_('Permissions'), {'fields': (
            'is_active', 'is_staff', 'is_superuser',
        )}),
        (_('Dates'), {'fields': (
            'last_login', 'date_joined'
        )}),
    )
    change_actions = (

    )
    actions = (

    )
    ordering = ('-date_joined',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.defer('client', 'groups', 'user_permissions')

    def delete_model(self, request, obj):
        from apps.confirmation.models.base import ConfirmationCode
        try:
            with transaction.atomic():
                # Удаляем связанные ConfirmationCode
                ConfirmationCode.objects.filter(user=obj).delete()
                obj.delete()
        except Exception as e:
            self.message_user(request, f'Ошибка при удалении пользователя: {str(e)}', level='error')
            raise

    @admin_description(_('Avatar'))
    def display_avatar(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="50" height="50" style="border-radius:30%; object-fit: cover;"/>',
                               obj.avatar.url)
        return format_html('<img src="{}" width="50" height="50" style="border-radius:30%; object-fit: cover;"/>',
                           '/static/core/img/icon/user.png')

    @admin_description('ID')
    @admin_order_field('id')
    def display_user_id(self, obj):
        url = reverse('admin:core_user_change', args=[obj.id])
        return format_html('<a href="{}">{}</a>', url, obj.id)

    @admin_description(_('User'))
    def display_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)
