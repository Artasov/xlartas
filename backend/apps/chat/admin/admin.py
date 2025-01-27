# chat/admin/admin.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from apps.chat.models import Room, Message, File


@admin.register(Room)
class RoomAdmin(ImportExportModelAdmin):
    list_display = ('name', 'max_participants')
    search_fields = (
        'name',
        'participants__id',
        'participants__username',
        'participants__first_name',
        'participants__last_name',
    )
    filter_horizontal = ('participants',)


@admin.register(Message)
class MessageAdmin(ImportExportModelAdmin):
    list_display = ('user', 'room', 'created_at', 'is_read')
    list_filter = ('room', 'is_read', 'created_at')
    search_fields = ('text',)
    date_hierarchy = 'created_at'


@admin.register(File)
class FileAdmin(ImportExportModelAdmin):
    list_display = ('file',)
