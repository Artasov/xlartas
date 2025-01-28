# apps/software/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import ProductPrice
from apps.software.models import (
    Software,
    SoftwareProduct,
    SoftwareOrder,
    SoftwareLicense,
)


# Inline для отображения цен продуктов в админке SoftwareProduct
class ProductPriceInline(admin.TabularInline):
    model = ProductPrice
    extra = 1
    readonly_fields = ('currency', 'amount')
    can_delete = False
    verbose_name = _('Price')
    verbose_name_plural = _('Prices')
    fields = ('currency', 'amount')


@admin.register(Software)
class SoftwareAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'review_link', 'file_link', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('is_active',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('name',)

    def review_link(self, obj):
        if obj.review_url:
            return format_html('<a href="{}" target="_blank">Обзор</a>', obj.review_url)
        return '-'

    review_link.short_description = _('Review')

    def file_link(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">Скачать</a>', obj.file.file.url)
        return '-'

    file_link.short_description = _('File')


@admin.register(SoftwareProduct)
class SoftwareProductAdmin(admin.ModelAdmin):
    list_display = ('software', 'license_hours', 'is_available', 'get_price', 'created_at', 'updated_at')
    search_fields = ('software__name', 'product__name')
    list_filter = ('software', 'is_available')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('software', 'license_hours')
    inlines = [ProductPriceInline]

    def get_price(self, obj):
        prices = obj.prices.all()
        if prices:
            return ', '.join([f"{price.amount} {price.currency}" for price in prices])
        return '-'

    get_price.short_description = _('Prices')


@admin.register(SoftwareOrder)
class SoftwareOrderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'product',
        'currency',
        'payment_system',
        'is_paid',
        'is_executed',
        'is_cancelled',
        'created_at',
        'updated_at',
    )
    search_fields = ('id', 'user__username', 'product__name')
    list_filter = ('payment_system', 'is_paid', 'is_executed', 'is_cancelled', 'currency')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    raw_id_fields = ('user', 'product', 'payment')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'product', 'payment')


@admin.register(SoftwareLicense)
class SoftwareLicenseAdmin(admin.ModelAdmin):
    list_display = ('user', 'software', 'license_ends_at', 'is_active_display', 'created_at', 'updated_at')
    search_fields = ('user__username', 'software__name')
    list_filter = ('software',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('software', 'license_ends_at')

    def is_active_display(self, obj):
        return obj.is_active()

    is_active_display.boolean = True
    is_active_display.short_description = _('Is Active')
