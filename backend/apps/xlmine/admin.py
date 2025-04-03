# xlmine/admin.py
from django.contrib.admin import register, ModelAdmin

from .models import Release, Launcher


@register(Launcher)
class LauncherAdmin(ModelAdmin):
    list_display = ('id', 'file', 'version')


@register(Release)
class ReleaseAdmin(ModelAdmin):
    list_display = ('id', 'file', 'version')
