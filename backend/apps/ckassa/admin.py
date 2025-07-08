from django.contrib import admin

from .models import CKassaPayment
from ..commerce.admin.shop import PaymentChildAdmin


@admin.register(CKassaPayment)
class CKassaPaymentAdmin(PaymentChildAdmin):
    list_display = ('id', 'reg_pay_num', 'status', 'amount', 'created_at')
    search_fields = ('reg_pay_num', 'status')
    list_filter = ('status',)
