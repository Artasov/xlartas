from django.contrib import admin

from .models import *

# ADMIN SETTINGS
admin.site.site_title = 'admin'
admin.site.site_header = 'xlartas admin'
admin.site.index_title = 'xlartas'


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'HWID', 'referral_code']
    list_editable = ['HWID', 'referral_code']
    save_on_top = True


@admin.register(UnconfirmedUser)
class UnconfirmedUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'date_created']
    save_on_top = True


@admin.register(UnconfirmedPasswordReset)
class UnconfirmedPasswordResetAdmin(admin.ModelAdmin):
    list_display = ['email', 'confirmation_code', 'date_created']
    save_on_top = True


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ['name', 'file']
    list_editable = ['file']
    save_on_top = True


