from django.contrib import admin

from apps.tinkoff.models import TinkoffDepositOrder


@admin.register(TinkoffDepositOrder)
class TinkoffDepositOrderAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'is_completed', 'amount', 'created_at', 'updated_at'
    )
