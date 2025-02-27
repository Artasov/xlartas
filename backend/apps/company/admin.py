# company/admin.py
from django.contrib import admin

from .models import Company, CompanyDocument


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'ogrn', 'inn', 'bik', 'current_account', 'checking_account')
    search_fields = ('name', 'ogrn', 'inn')
    list_filter = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CompanyDocument)
class CompanyDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'is_public', 'created_at')
    search_fields = ('title', 'company__name')
    list_filter = ('company', 'is_public')
    readonly_fields = ('created_at', 'updated_at')
