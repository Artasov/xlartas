# software/admin/software.py
from adjango.decorators import admin_description, admin_boolean
from django.contrib.admin import register, TabularInline, ModelAdmin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from apps.commerce.models import ProductPrice
from apps.software.models import Software, SoftwareOrder, SoftwareLicense, SoftwareFile


class ProductPriceInline(TabularInline):
    """
    Так как Software наследуется от Product,
    мы можем редактировать связанные цены (ProductPrice).
    """
    model = ProductPrice
    extra = 1
    readonly_fields = ()
    can_delete = True
    verbose_name = _('Price')
    verbose_name_plural = _('Prices')
    fields = ('currency', 'amount')


@register(SoftwareFile)
class SoftwareFileAdmin(ModelAdmin):
    list_display = (
        'id', 'file', 'version',
    )


@register(Software)
class SoftwareAdmin(ModelAdmin):
    list_display = (
        'name', 'version_display', 'is_available', 'min_license_order_hours',
        'file_link', 'review_link', 'created_at', 'updated_at',
    )
    list_filter = ('is_available',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [ProductPriceInline]

    @admin_description(_('Review'))
    def review_link(self, obj):
        if obj.review_url:
            return format_html('<a href="{}" target="_blank">Обзор</a>', obj.review_url)
        return '-'

    @admin_description(_('Version'))
    def version_display(self, obj):
        return f'v{obj.file.version}' if obj.file else ''

    @admin_description(_('File'))
    def file_link(self, obj):
        if obj.file and obj.file.file:
            return format_html('<a href="{}" target="_blank">Скачать</a>', obj.file.file.url)
        return '-'


@register(SoftwareOrder)
class SoftwareOrderAdmin(ModelAdmin):
    list_display = (
        'id', 'user', 'product', 'license_hours', 'currency',
        'payment_system', 'is_paid', 'is_executed', 'is_cancelled',
        'created_at', 'updated_at',
    )
    search_fields = ('id', 'user__username', 'product__name')
    list_filter = ('payment_system', 'is_paid', 'is_executed', 'is_cancelled', 'currency')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    raw_id_fields = ('user', 'payment', 'product')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'product', 'payment'
        )


@register(SoftwareLicense)
class SoftwareLicenseAdmin(ModelAdmin):
    list_display = ('user', 'software', 'license_ends_at', 'is_active_display', 'created_at', 'updated_at')
    search_fields = ('user__username', 'software__name')
    list_filter = ('software',)
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    @admin_description(_('Is Active'))
    @admin_boolean(True)
    def is_active_display(self, obj): return obj.is_active()
