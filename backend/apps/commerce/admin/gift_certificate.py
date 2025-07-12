# commerce/admin/gift_certificate.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from polymorphic.admin import PolymorphicChildModelAdmin

from apps.commerce.models.gift_certificate import (
    GiftCertificate,
    GiftCertificateOrder,
    GiftCertificateUsage,
)


@admin.register(GiftCertificate)
class GiftCertificateAdmin(ImportExportModelAdmin):
    list_display = ('id', 'product', 'created_at', 'updated_at')
    search_fields = ('product__name',)
    list_filter = ('created_at', 'updated_at')
    raw_id_fields = ('product',)


@admin.register(GiftCertificateOrder)
class GiftCertificateOrderAdmin(PolymorphicChildModelAdmin):
    base_model = GiftCertificateOrder
    show_in_index = True
    list_display = (
        'id', 'user', 'product', 'payment_system', 'is_paid',
        'is_executed', 'is_cancelled', 'created_at', 'updated_at'
    )
    search_fields = ('id', 'user__username', 'product__id', 'key')
    list_filter = ('payment_system', 'currency', 'is_paid', 'is_cancelled')
    raw_id_fields = ('user', 'payment', 'product')


@admin.register(GiftCertificateUsage)
class GiftCertificateUsageAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'user', 'created_at')
    search_fields = ('order__id', 'user__username')
    list_filter = ('created_at',)
    raw_id_fields = ('order', 'user')