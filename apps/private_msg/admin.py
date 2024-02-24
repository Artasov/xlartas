from django.contrib import admin

from .models import PrivateMsg


@admin.register(PrivateMsg)
class PrivateMsgAdmin(admin.ModelAdmin):
    list_display = ['key', 'msg', 'file', 'date_for_del', 'date_created']
