from django.contrib import admin
from apps.software.models.wireless import WirelessMacro


@admin.register(WirelessMacro)
class WirelessMacroAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'name', 'priority')
    search_fields = ('owner__username', 'name')
    list_filter = ('owner',)
    ordering = ('priority', 'name')