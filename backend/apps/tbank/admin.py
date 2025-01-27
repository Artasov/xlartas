# tbank/admin.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from .models import TBankCustomer, TBankPayment, TBankRecurringPayment, TBankInstallment
from ..commerce.admin import PaymentChildAdmin


@admin.register(TBankCustomer)
class TBankCustomerAdmin(ImportExportModelAdmin):
    list_display = ('user', 'key')
    search_fields = ('user__username', 'key')


@admin.register(TBankPayment)
class TBankPaymentAdmin(PaymentChildAdmin):
    list_display = ('id', 'customer', 'order_id', 'status', 'amount', 'source', 'created_at')
    search_fields = ('customer__user__username', 'order_id', 'status')
    list_filter = ('status', 'source')

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('customer')


@admin.register(TBankRecurringPayment)
class TBankRecurringPaymentAdmin(ImportExportModelAdmin):
    list_display = ('customer', 'rebillid', 'next_payment_date', 'interval_days')
    search_fields = ('customer__user__username', 'rebillid')


@admin.register(TBankInstallment)
class TBankInstallmentAdmin(ImportExportModelAdmin):
    list_display = ('order_id', 'status', 'amount', 'chosen_bank', 'monthly_payment')
    search_fields = ('order_id', 'status', 'chosen_bank')
