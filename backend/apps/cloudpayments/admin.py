# tbank/admin.py
from django.contrib import admin

from .models import CloudPaymentPayment
from ..commerce.admin import PaymentChildAdmin


@admin.register(CloudPaymentPayment)
class CloudPaymentAdmin(PaymentChildAdmin):
    list_display = ('id', 'transaction_id', 'status', 'amount', 'created_at')
    search_fields = ('status',)
    list_filter = ('status',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset
