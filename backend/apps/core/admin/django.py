# core/admin/django.py

from django.contrib import admin
from django.contrib.contenttypes.models import ContentType


@admin.register(ContentType)
class ContentTypeAdmin(admin.ModelAdmin):
    list_display = ('app_label', 'model')
