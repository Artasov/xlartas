from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from polymorphic.admin import PolymorphicChildModelAdmin

from apps.commerce.models import BalancePayment, BalanceProduct, BalanceProductOrder


@admin.register(BalanceProduct)
class BalanceProductAdmin(ImportExportModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('created_at', 'updated_at')


@admin.register(BalanceProductOrder)
class BalanceProductOrderAdmin(PolymorphicChildModelAdmin):
    base_model = BalanceProductOrder
    show_in_index = True
    list_display = (
        'id', 'user', 'product', 'requested_amount', 'currency',
        'payment_system', 'is_paid', 'is_executed', 'is_cancelled',
        'created_at', 'updated_at'
    )
    search_fields = ('id', 'user__username')
    list_filter = ('payment_system', 'currency')
    raw_id_fields = ('user', 'payment', 'product')


@admin.register(BalancePayment)
class BalancePaymentAdmin(PolymorphicChildModelAdmin):
    base_model = BalancePayment
    show_in_index = True
    list_display = ('__str__', 'amount', 'currency', 'created_at', 'updated_at')
    search_fields = ('id',)
    list_filter = ('currency',)
