# mailing/admin.py
from django.contrib.admin import ModelAdmin, register, action
from django.forms import ModelForm
from tinymce.widgets import TinyMCE  # noqa

from .models import Mailing
from .tasks import send_mailing


class MailingAdminForm(ModelForm):
    class Meta:
        model = Mailing
        fields = '__all__'
        widgets = {
            # Используем TinyMCE для поля html_content
            'html_content': TinyMCE(),
        }


@register(Mailing)
class MailingAdmin(ModelAdmin):
    form = MailingAdminForm
    list_display = ('subject', 'start_date', 'sent', 'created_at')
    list_editable = ('sent',)
    list_filter = ('sent', 'start_date')
    search_fields = ('subject', 'html_content')
    filter_horizontal = ('users',)
    actions = ['send_selected_mailings']

    @action(description='Отправить выбранные рассылки')
    def send_selected_mailings(self, request, queryset):
        for mailing in queryset:
            if not mailing.sent: send_mailing.delay(mailing.id)
        self.message_user(request, 'Выбранные рассылки отправлены.')
