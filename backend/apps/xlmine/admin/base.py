# xlmine/admin/base.py
from django.contrib.admin import register, ModelAdmin, display
from django.forms import ModelForm, TextInput
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from apps.xlmine.models import Launcher, Release, Donate, DonateOrder, Privilege
from apps.xlmine.models.user import UserXLMine, MinecraftSession
from utils.gradient_by_symbol_text import generate_gradient_text


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


class PrivilegeAdminForm(ModelForm):
    class Meta:
        model = Privilege
        fields = '__all__'
        widgets = {
            'gradient_start': TextInput(attrs={'type': 'color'}),
            'gradient_end': TextInput(attrs={'type': 'color'}),
        }


@register(Privilege)
class PrivilegeAdmin(ModelAdmin):
    form = PrivilegeAdminForm
    list_display = (
        'id',
        'name',
        'code_name',
        'prefix',
        'gradient_start',
        'gradient_end',
        'colored_prefix',
        'weight',
        'threshold',
        'description',
    )
    list_editable = (
        'name',
        'code_name',
        'prefix',
        'gradient_start',
        'gradient_end',
        'weight',
        'threshold',
        'description',
    )
    search_fields = ('name',)
    actions = ('sync_remote',)

    def get_changelist_form(self, request, **kwargs):
        return PrivilegeAdminForm

    @display(description=_('Sync remote'))
    def sync_remote(self, request, queryset):
        for p in queryset:
            p.sync_sync_remote()
            self.message_user(request, f'Privilege {p.name}: remote synced')

    @display(description=_('Colored Prefix'))
    def colored_prefix(self, obj):
        s = obj.prefix or ''
        html = ''
        i = 0
        while i < len(s):
            if s.startswith('&#', i) and len(s) >= i + 9:
                hexcode = s[i + 2:i + 8]
                char = s[i + 8]
                html += format_html(
                    '<span style="color:#{}; font-size:1.2em; font-weight:bold;">{}</span>',
                    hexcode, char
                )
                i += 9
            else:
                html += escape(s[i])
                i += 1
        return mark_safe(html)

    def save_model(self, request, obj, form, change):
        start = obj.gradient_start
        end = obj.gradient_end
        print(start, end)
        if start and end:
            obj.prefix = generate_gradient_text(obj.prefix, start, end)
        super().save_model(request, obj, form, change)


@register(UserXLMine)
class UserXLMineAdmin(ModelAdmin):
    list_display = ('user', 'coins')
    search_fields = ('user__username',)


@register(MinecraftSession)
class MinecraftSessionAdmin(ModelAdmin):
    list_display = ('user__xlmine_user__uuid', 'access_token', 'client_token', 'last_server_id', 'created_at')
