from django.contrib import admin
from django.utils.html import format_html

from apps.Core.models import *

# ADMIN SETTINGS
admin.site.site_title = 'admin'
admin.site.site_header = 'xlartas admin'
admin.site.index_title = 'xlartas'


@admin.register(CompanyData)
class CompanyDataAdmin(admin.ModelAdmin):
    list_display = ['param', 'value']
    list_editable = ['value']
    save_on_top = True


@admin.register(ConfirmationCode)
class ConfirmationCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code']
    save_on_top = True


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'image_preview')

    def image_preview(self, obj):
        if obj.bg_image:
            return format_html(
                '<img src="{}" width="150" height="auto" />',
                obj.bg_image.url
            )
        return "Нет изображения"

    image_preview.short_description = "Предпросмотр изображения"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'days_from_join', 'balance', 'email', 'hw_id', 'referral_code']
    list_editable = ['balance', 'hw_id', 'referral_code']
    save_on_top = True
    search_fields = ['username', 'hw_id']

    def days_from_join(self, obj: User):
        if obj.date_joined is not None:
            count_days = (timezone.now().date() - obj.date_joined.date()).days
            if count_days == 0:
                count_days = 'Today'
            elif count_days < 0:
                count_days = 0
            return count_days
        else:
            return None

    days_from_join.short_description = 'Joined ago'


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'created_at']
    save_on_top = True


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ['name', 'file']
    list_editable = ['file']
    save_on_top = True
