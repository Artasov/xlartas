from asgiref.sync import async_to_sync
from django.contrib import admin, messages

from apps.tinkoff.models import TinkoffDepositOrder
from apps.tinkoff.services.orders import execute_tinkoff_deposit_order_by_id


@admin.action(description='Execute order')
def execute_order(modeladmin, request, queryset):
    for order in queryset:
        try:
            async_to_sync(execute_tinkoff_deposit_order_by_id)(order.order_id)
            modeladmin.message_user(request, f"Order {order.order_id} successfully executed.", messages.SUCCESS)
        except Exception as e:
            modeladmin.message_user(request, f"Error while completing order {order.id}: {str(e)}", messages.ERROR)


@admin.register(TinkoffDepositOrder)
class TinkoffDepositOrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_completed', 'amount', 'created_at', 'updated_at')
    actions = [execute_order]
