# xlmine/admin/base.py
from django.contrib.admin import register, ModelAdmin

from apps.xlmine.models import Launcher, Release, Donate, DonateOrder, Privilege
from apps.xlmine.models.user import UserXLMine, MinecraftSession


@register(Launcher)
class LauncherAdmin(ModelAdmin):
    list_display = ('id', 'file', 'version')
    search_fields = ('version',)


@register(Release)
class ReleaseAdmin(ModelAdmin):
    list_display = ('id', 'file', 'version')
    search_fields = ('version',)


@register(Donate)
class DonateAdmin(ModelAdmin):
    list_display = ('id', 'name', 'is_available')
    search_fields = ('name',)
    list_filter = ('is_available',)


@register(DonateOrder)
class DonateOrderAdmin(ModelAdmin):
    list_display = ('id', 'user', 'product', 'currency', 'payment_system', 'created_at')
    list_filter = ('created_at', 'currency', 'payment_system')
    search_fields = ('user__username', 'product__name')


@register(Privilege)
class PrivilegeAdmin(ModelAdmin):
    list_display = (
        'id',
        'name',
        'code_name',
        'prefix',
        'threshold',
        'color',
        'description'
    )
    list_editable = (
        'name',
        'code_name',
        'prefix',
        'threshold',
        'color',
        'description'
    )
    search_fields = ('name',)


@register(UserXLMine)
class UserXLMineAdmin(ModelAdmin):
    list_display = ('user', 'coins')
    search_fields = ('user__username',)


@register(MinecraftSession)
class MinecraftSessionAdmin(ModelAdmin):
    list_display = ('user__xlmine_user__uuid', 'access_token', 'client_token', 'last_server_id', 'created_at')
