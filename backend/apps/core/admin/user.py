# core/admin/user.py
import logging

from adjango.decorators import admin_description, admin_order_field
from django.contrib import admin, messages
from django.db import transaction
from django.urls import reverse
from django.utils.html import format_html, escape
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django_object_actions import DjangoObjectActions
from import_export.admin import ImportExportModelAdmin

from apps.core.models import User, Role
from apps.xlmine.tasks import teleport_world_scan

admin.site.site_header = 'xlartas'
admin.site.site_title = 'xlartas'
admin.site.index_title = ''

log = logging.getLogger('global')


@admin.register(Role)
class RoleAdmin(DjangoObjectActions, ImportExportModelAdmin):
    list_display = ('id', 'name')


@admin.register(User)
class UserAdmin(DjangoObjectActions, ImportExportModelAdmin):
    list_display = (
        'id',
        'display_avatar',
        'username',
        'current_privilege',
        'email',
        'phone',
        'hw_id',
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
        'hw_id',
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
    list_display_links = ('id', 'display_avatar', 'email')

    fieldsets = (
        (_('General info'), {'fields': (
            'display_user_id',
            'display_avatar', 'avatar',
            'username',
            'first_name', 'last_name', 'middle_name',
            'email', 'phone',
            'password',
            'hw_id',
            'roles',
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
        'run_world_scan',
        'upgrade_privilege',
        'downgrade_privilege',
        'rcon_sync_privilege',
        'calc_and_set_current_privilege',
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

    @admin.action(description='Запустить телепорт-скан мира')
    def run_world_scan(self, request, _):
        """
        Одним нажатием запускает Celery-задачу teleport_world_scan.
        Выделённые пользователи ни на что не влияют — action
        просто запускает фоновую задачу с хардкод-координатами.
        """
        async_result = teleport_world_scan.delay()
        messages.success(
            request,
            f'Celery-задача {async_result.id} запущена. '
            'Скан займёт ~N часов, см. логи Celery.'
        )
        log.info(
            f'Admin action run_world_scan triggered Celery task {async_result.id}'
        )

    @admin_description(_('Privilege'))
    def current_privilege(self, obj):
        xlm = obj.xlmine_user
        prefix_code = xlm.privilege.prefix if xlm.privilege else ''
        if not prefix_code:
            return '-'
        html = ''
        s = prefix_code
        i = 0
        while i < len(s):
            # паттерн "&#RRGGBB<символ>" — 9 символов
            if s.startswith('&#', i) and len(s) >= i + 9:
                hexcode = s[i + 2:i + 8]
                char = s[i + 8]
                html += format_html(
                    '<span style="color:#{}">{}</span>',
                    hexcode,
                    char
                )
                i += 9
            else:
                html += escape(s[i])
                i += 1
        return mark_safe(html)

    @admin_description(_('Upgrade privilege'))
    def upgrade_privilege(self, _, queryset):
        for user in queryset:
            user.sync_upgrade_privilege()

    @admin_description(_('Downgrade privilege'))
    def downgrade_privilege(self, _, queryset):
        for user in queryset:
            user.sync_downgrade_privilege()

    @admin_description(_('RCON privilege sync'))
    def sync_privilege(self, _, queryset):
        for user in queryset:
            user.sync_rcon_sync_privilege()

    @admin_description(_('Calc and set current privilege'))
    def calc_and_set_current_privilege(self, _, queryset):
        for user in queryset:
            user.sync_calc_and_set_current_privilege()

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

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)
