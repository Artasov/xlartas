from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from apps.commerce.models.promocode import (
    Promocode, PromocodeUsage, PromocodeProductDiscount
)


@admin.register(Promocode)
class PromocodeAdmin(ImportExportModelAdmin):
    list_display = (
        'name',
        'code',
        'discount_type',
        'start_date',
        'end_date'
    )
    search_fields = ('name', 'code')
    list_filter = ('discount_type', 'start_date', 'end_date')
    ordering = ('-start_date',)
    fieldsets = (
        (None, {
            'fields': (
                'name',
                'code',
                'description',
                'discounts',
                'discount_type',
                'start_date',
                'end_date'
            )
        }),
    )


@admin.register(PromocodeProductDiscount)
class PromocodeProductDiscountAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'max_usage',
        'interval_days',
        'max_usage_per_user',
        'amount', 'currency',
    )
    search_fields = (
        'products__name',
    )
    list_filter = (
        'currency',
        'max_usage',
        'interval_days'
    )
    fieldsets = (
        (None, {
            'fields': (
                'product',
                'amount', 'currency',
                'max_usage',
                'interval_days',
                'max_usage_per_user',
                'specific_users',
            )
        }),
    )
    filter_horizontal = ('specific_users',)


@admin.register(PromocodeUsage)
class PromocodeUsageAdmin(admin.ModelAdmin):
    list_display = (
        'promocode',
        'user',
        'created_at'
    )
    search_fields = (
        'promocode__code',
        'user__username',
    )
    list_filter = ('created_at',)
    ordering = ('-created_at',)
