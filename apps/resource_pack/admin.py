from django.contrib import admin

from .models import *


@admin.register(ResourcePack)
class ResourcePackAdmin(admin.ModelAdmin):
    list_display = ['name',  'available', 'uploaded_by',
                    'likes', 'downloads', 'style', 'color', 'resolution']
    list_editable = ['available', 'likes', 'downloads', 'style', 'color', 'resolution']
    save_on_top = True
    search_fields = ['name']


@admin.register(ResourcePackImage)
class ResourcePackImageAdmin(admin.ModelAdmin):
    list_display = ['resource_pack']
    search_fields = ['resource_pack__name']
    save_on_top = True


