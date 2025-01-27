# commerce/admin/client.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from apps.commerce.models.client import Client


@admin.register(Client)
class ClientAdmin(ImportExportModelAdmin):
    list_display = ('user', 'status')
    search_fields = ('user__username', 'status')
    list_filter = ('status',)
