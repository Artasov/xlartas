# analytics/admin.py
from django.contrib.admin import register, ModelAdmin

from .models import Visit


@register(Visit)
class VisitAdmin(ModelAdmin):
    list_display = ('ip_address', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('ip_address',)
