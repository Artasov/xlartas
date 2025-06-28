# theme/admin.py
from django.contrib import admin
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin

from apps.theme.models import Theme


@admin.register(Theme)
class ThemeAdmin(ImportExportModelAdmin):
    list_display = ('name', 'mode', 'is_default', 'image_preview')
    list_editable = ('mode', 'is_default')

    def image_preview(self, obj):
        if obj.bg_image:
            return format_html(
                '<img src="{}" width="150" height="auto" />',
                obj.bg_image.url
            )
        return 'Нет изображения'

    image_preview.short_description = 'Предпросмотр изображения'
