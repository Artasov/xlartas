from django.contrib import admin
from django.utils.html import format_html

from .models import Folder, File, Tag, FileTag, FolderTag


class FolderTagInline(admin.TabularInline):
    model = FolderTag
    extra = 1
    autocomplete_fields = ['tag']


class FileTagInline(admin.TabularInline):
    model = FileTag
    extra = 1
    autocomplete_fields = ['tag']


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'parent', 'tag_list')
    search_fields = ('name', 'user__username',)
    list_filter = ('user',)
    autocomplete_fields = ('user', 'parent')
    inlines = [FolderTagInline]

    def tag_list(self, obj):
        return ", ".join([t.name for t in obj.tags.all()])

    tag_list.short_description = "Tags"


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'folder', 'file_size', 'tag_list')
    search_fields = ('name', 'user__username')
    list_filter = ('user',)
    autocomplete_fields = ('user', 'folder')
    inlines = [FileTagInline]

    def file_size(self, obj):
        return obj.file.size

    file_size.short_description = "File Size (bytes)"

    def tag_list(self, obj):
        return ", ".join([t.name for t in obj.tags.all()])

    tag_list.short_description = "Tags"


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'color_display')
    search_fields = ('name', 'user__username')
    list_filter = ('user',)

    def color_display(self, obj):
        return format_html('<span style="background-color: {}; padding: 2px 6px; border-radius: 3px;">{}</span>',
                           obj.color, obj.color)

    color_display.short_description = "Color"


@admin.register(FileTag)
class FileTagAdmin(admin.ModelAdmin):
    list_display = ('file', 'tag')
    search_fields = ('file__name', 'tag__name')
    list_filter = ('file', 'tag')
    autocomplete_fields = ('file', 'tag')


@admin.register(FolderTag)
class FolderTagAdmin(admin.ModelAdmin):
    list_display = ('folder', 'tag')
    search_fields = ('folder__name', 'tag__name')
    list_filter = ('folder', 'tag')
    autocomplete_fields = ('folder', 'tag')
