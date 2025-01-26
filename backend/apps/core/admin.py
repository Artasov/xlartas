from django.contrib import admin
from django.utils.html import format_html
from django.utils.timezone import now

from apps.core.models.common import CompanyData, Theme, File
from apps.core.models.social import DiscordUser
from apps.core.models.user import User

# ADMIN SETTINGS
admin.site.site_title = 'admin'
admin.site.site_header = 'xlartas admin'
admin.site.index_title = 'xlartas'


@admin.register(CompanyData)
class CompanyDataAdmin(admin.ModelAdmin):
    list_display = ('param', 'value')
    list_editable = ('value',)
    save_on_top = True


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'mode', 'is_default', 'image_preview')
    list_editable = ('mode', 'is_default')

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
    list_display = (
        'username', 'days_from_join', 'is_confirmed', 'balance', 'email', 'last_login', 'hw_id', 'referral_code')
    list_editable = ('balance', 'is_confirmed', 'hw_id', 'referral_code')
    save_on_top = True
    search_fields = ('username', 'hw_id', 'email', 'is_confirmed')

    def days_from_join(self, obj: User):
        if obj.date_joined is not None:
            count_days = (now().date() - obj.date_joined.date()).days
            if count_days == 0:
                count_days = 'Today'
            elif count_days < 0:
                count_days = 0
            return count_days
        else:
            return None

    days_from_join.short_description = 'Joined ago'


@admin.register(DiscordUser)
class DiscordUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'id')


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'file')
    list_editable = ('file',)
    save_on_top = True
