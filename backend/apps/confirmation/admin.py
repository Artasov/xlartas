from django.contrib import admin

from apps.confirmation.models.base import ConfirmationCode


@admin.register(ConfirmationCode)
class ConfirmationCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code']
    save_on_top = True
