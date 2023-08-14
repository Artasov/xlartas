from django.contrib import admin
from datetime import datetime, timedelta

from django.utils import timezone
from .models import *


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'product', 'is_complete', 'date_created']
    search_fields = ['user__username']
    save_on_top = True


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'desc', 'log_changes', 'sale']
    list_editable = ['version', 'desc', 'log_changes', 'sale']
    save_on_top = True


@admin.register(Subscription)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['user', 'product',
                    'is_test_period_activated',
                    'count_starts',
                    'count_days_for_expiration', 'date_expiration']
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

@admin.register(Promo)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['promo', 'promo_type', 'promo_value', 'applys_now', 'applys_max', 'date_expiration']
    list_editable = ['applys_now', 'applys_max', 'date_expiration']
    filter_horizontal = ['used_by', 'products']
    save_on_top = True