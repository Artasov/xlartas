from django.contrib import admin, messages
from django.db import transaction

from .funcs import execute_software_order
from .models import *


@admin.action(description='Execute selected orders')
def execute_selected_orders(request, queryset):
    with transaction.atomic():
        for order in queryset:
            execute_software_order(order)
    messages.success(request, f'Executed {queryset.count()} orders successfully.')


@admin.register(SoftwareSubscriptionOrder)
class SoftwareSubscriptionOrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'software', 'is_completed', 'created_at')
    search_fields = ('user__username',)
    save_on_top = True
    actions = (execute_selected_orders,)
    ordering = ('-created_at',)


@admin.register(SoftwareProduct)
class SoftwareProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'desc', 'log_changes', 'discount',)
    list_editable = ('version', 'desc', 'log_changes', 'discount',)
    save_on_top = True


@admin.register(SoftwareSubscription)
class SoftwareSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'software', 'time_category', 'amount',)
    list_editable = ('name', 'time_category', 'amount',)
    ordering = ('software', 'amount')


@admin.register(SubscriptionTimeCategory)
class SubscriptionTimeCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'hours',)
    list_editable = ('name', 'hours',)


@admin.register(UserSoftwareSubscription)
class UserSoftwareSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'software',
        'is_test_period_activated',
        'starts',
        'count_days_for_expiration',
        'expires_at',
    )
    list_editable = (
        'is_test_period_activated',
        'expires_at',
    )
    search_fields = ('user__username',)
    save_on_top = True

    def count_days_for_expiration(self, obj):
        if obj.expires_at is not None:
            count_days = (obj.expires_at.date() - timezone.now().date()).days
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
    list_display = (
        'id',
        'name',
    )
    list_editable = (
        'name',
    )


@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = (
        'code',
        'type',
        'value',
        'applys_now',
        'applys_max',
        'expires_at',
    )
    list_editable = (
        'type',
        'value',
        'applys_now',
        'applys_max',
        'expires_at',
    )
    filter_horizontal = ('used_by',)
    save_on_top = True
