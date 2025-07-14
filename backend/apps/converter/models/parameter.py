# converter/models/parameter.py
from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import (CASCADE, CharField, ForeignKey, IntegerField,
                              TextChoices)
from django.utils.translation import gettext_lazy as _


class ParameterType(TextChoices):
    BOOL = "bool", _("Boolean")
    INT = "int", _("Integer")
    STR = "str", _("String")
    SELECT = "select", _("Select")


class Parameter(ACreatedUpdatedAtIndexedMixin, AModel):
    format = ForeignKey(
        "converter.Format", CASCADE, related_name="parameters", verbose_name=_("Format")
    )
    name = CharField(max_length=50, verbose_name=_("Name"))
    type = CharField(
        max_length=10, choices=ParameterType.choices, verbose_name=_("Type")
    )
    unit = CharField(max_length=20, blank=True, null=True, verbose_name=_("Unit"))
    min_value = IntegerField(blank=True, null=True, verbose_name=_("Min value"))
    max_value = IntegerField(blank=True, null=True, verbose_name=_("Max value"))
    default_value = CharField(max_length=100, blank=True, null=True, verbose_name=_("Default value"))

    class Meta:
        verbose_name = _("Parameter")
        verbose_name_plural = _("Parameters")
        unique_together = ("format", "name")

    def __str__(self) -> str:
        return f"{self.format.name}: {self.name}"


class ParameterOption(AModel):
    parameter = ForeignKey(
        Parameter, CASCADE, related_name="options", verbose_name=_("Parameter")
    )
    value = CharField(max_length=100, verbose_name=_("Value"))

    class Meta:
        verbose_name = _("Parameter option")
        verbose_name_plural = _("Parameter options")
        unique_together = ("parameter", "value")

    def __str__(self) -> str:
        return self.value
