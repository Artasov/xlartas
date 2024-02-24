from django.contrib import admin, messages
from datetime import datetime, timedelta

from django.db import transaction
from django.utils import timezone

from .funcs import execute_order
from .models import *


@admin.action(description='Execute selected orders')
def execute_selected_orders(modeladmin, request, queryset):
    with transaction.atomic():
        for order in queryset:
            execute_order(order)
    messages.success(request, f'Executed {queryset.count()} orders successfully.')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'product', 'is_complete', 'date_created']
    search_fields = ['user__username']
    save_on_top = True
    actions = [execute_selected_orders]
    ordering = ('-date_created',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'desc', 'log_changes', 'discount']
    list_editable = ['version', 'desc', 'log_changes', 'discount']
    save_on_top = True


@admin.register(Subscription)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['user', 'product',
                    'is_test_period_activated',
                    'count_starts',
                    'count_days_for_expiration',
                    'date_expiration'
                    ]
    list_editable = ['date_expiration']
    search_fields = ['user__username']
    save_on_top = True

    def count_days_for_expiration(self, obj):
        if obj.date_expiration is not None:
            count_days = (obj.date_expiration.date() - timezone.now().date()).days
            if count_days == 0:
                count_days = 'Today'
            elif count_days < 0:
                count_days = 0
            return count_days
        else:
            return None

    count_days_for_expiration.short_description = 'Days left'


@admin.register(PromoGroup)
class PromoGroupAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name'
    ]
    list_editable = [
        'name'
    ]


@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = [
        'code',
        'type',
        'value',
        'applys_now',
        'applys_max',
        'date_expiration'
    ]
    list_editable = [
        'type',
        'value',
        'applys_now',
        'applys_max',
        'date_expiration']
    filter_horizontal = ['used_by']
    save_on_top = True
