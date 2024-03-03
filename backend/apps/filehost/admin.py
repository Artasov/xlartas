from django.contrib import admin
from .models import Upload, UploadedFile
# Register your models here.


@admin.register(Upload)
class UploadAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'date_delete']


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['upload', 'name', 'size', 'file']