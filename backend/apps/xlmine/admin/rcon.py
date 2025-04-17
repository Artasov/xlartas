# xlmine/admin/rcon.py
from django import forms
from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path

from apps.xlmine.services.server.console import RconServerConsole


# Форма для ввода RCON команды.
class RconCommandForm(forms.Form):
    command = forms.CharField(
        widget=forms.Textarea(attrs={
            'rows': 4, 'cols': 60,
            'class': 'form-control'
        }),
        label="RCON Команда"
    )


# View для отображения страницы RCON-консоли.
def rcon_console_view(request):
    output = None
    if request.method == "POST":
        form = RconCommandForm(request.POST)
        if form.is_valid():
            command = form.cleaned_data["command"]
            # Используем наш класс для отправки команды RCON.
            output = RconServerConsole().send_command(command)
    else:
        form = RconCommandForm()
    context = {
        "title": "RCON Консоль",
        "form": form,
        "output": output,
        "site_title": admin.site.site_title,
        "site_header": admin.site.site_header,
    }
    return TemplateResponse(request, "admin/rcon_console.html", context)


# Добавляем новый URL в админку.
original_get_urls = admin.site.get_urls()


def get_urls():
    custom_urls = [
        path('rcon_console/', admin.site.admin_view(rcon_console_view), name='rcon_console'),
    ]
    return custom_urls + original_get_urls


admin.site.get_urls = get_urls
