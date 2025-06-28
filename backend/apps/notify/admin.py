# notify/admin.py
import json

from django.contrib import admin
from django.db import models
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from apps.notify.models import Notify


@admin.register(Notify)
class NotifyAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient_link', 'notify_type_display', 'status', 'scheduled_time', 'sent_time')
    search_fields = ('recipient__username', 'recipient__first_name', 'recipient__last_name', 'notify_type')
    list_filter = ('status', 'notify_type', 'scheduled_time', 'sent_time')
    readonly_fields = (
        'id', 'recipient_link', 'notify_type_display', 'status', 'scheduled_time', 'sent_time', 'context_display')
    ordering = ('-scheduled_time',)

    fieldsets = (
        (None, {
            'fields': (
                'id',
                'recipient_link',
                'notify_type_display',
                'status',
                'scheduled_time',
                'sent_time',
                'context_display',
            )
        }),
    )

    def recipient_link(self, obj):
        recipient = obj.recipient
        url = reverse('admin:core_user_change', args=[recipient.id])
        name = f'{recipient.get_full_name()} (ID: {recipient.id})'
        return format_html('<a href="{}">{}</a>', url, name)

    recipient_link.short_description = _('Recipient')

    def notify_type_display(self, obj):
        from .registry import Notifies
        try:
            notify_type_label = Notifies(obj.notify_type).label
            return f'{notify_type_label} ({obj.notify_type})'
        except ValueError:
            return obj.notify_type

    notify_type_display.short_description = _('Notification Type')

    def context_display(self, obj):
        context_json = json.dumps(obj.context, indent=2, ensure_ascii=False)
        return format_html('<pre>{}</pre>', context_json)

    context_display.short_description = _('Context')

    def has_add_permission(self, request):
        # Disable adding new notifications from the admin
        return False

    def has_change_permission(self, request, obj=None):
        # Disable editing notifications from the admin
        return False

    formfield_overrides = {
        models.JSONField: {'widget': admin.widgets.AdminTextareaWidget},  # noqa
    }
