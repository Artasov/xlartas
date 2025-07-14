# converter/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from import_export.admin import ImportExportModelAdmin

from apps.converter.models import (
    Conversion,
    ConversionVariant,
    Format,
    Parameter,
    ParameterOption,
)


class ParameterOptionInline(admin.TabularInline):
    model = ParameterOption
    extra = 1
    autocomplete_fields = ["parameter"]


class ParameterInline(admin.TabularInline):
    model = Parameter
    extra = 1


@admin.register(Format)
class FormatAdmin(ImportExportModelAdmin):
    list_display = ("name", "icon_preview", "created_at", "updated_at")
    search_fields = ("name",)
    inlines = [ParameterInline]

    def icon_preview(self, obj):
        if obj.icon:
            return format_html('<img src="{}" width="50" height="50" />', obj.icon.url)
        return _("No icon")

    icon_preview.short_description = _("Icon")


@admin.register(Parameter)
class ParameterAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "format",
        "type",
        "unit",
        "min_value",
        "max_value",
    )
    list_filter = ("format", "type")
    search_fields = ("name", "format__name")
    autocomplete_fields = ("format",)
    inlines = [ParameterOptionInline]


@admin.register(ParameterOption)
class ParameterOptionAdmin(admin.ModelAdmin):
    list_display = ("parameter", "value")
    search_fields = ("parameter__name", "value")
    list_filter = ("parameter",)
    autocomplete_fields = ("parameter",)


@admin.register(ConversionVariant)
class ConversionVariantAdmin(admin.ModelAdmin):
    list_display = ("source", "targets_list")
    search_fields = ("source__name", "targets__name")
    list_filter = ("source",)
    filter_horizontal = ("targets",)

    def targets_list(self, obj):
        return ", ".join(t.name for t in obj.targets.all())

    targets_list.short_description = _("Targets")


@admin.register(Conversion)
class ConversionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "ip",
        "source_format",
        "target_format",
        "is_done",
        "created_at",
        "updated_at",
    )
    list_filter = ("is_done", "source_format", "target_format")
    search_fields = ("user__username", "ip")
    autocomplete_fields = ("user", "source_format", "target_format")
    readonly_fields = ("created_at", "updated_at")
