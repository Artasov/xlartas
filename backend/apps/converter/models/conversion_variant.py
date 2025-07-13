from adjango.models import AModel
from django.db.models import CASCADE, ForeignKey, ManyToManyField
from django.utils.translation import gettext_lazy as _


class ConversionVariant(AModel):
    source = ForeignKey(
        "converter.Format",
        CASCADE,
        related_name="source_variants",
        verbose_name=_("Source format"),
    )
    targets = ManyToManyField(
        "converter.Format",
        related_name="target_variants",
        verbose_name=_("Target formats"),
    )

    class Meta:
        verbose_name = _("Conversion variant")
        verbose_name_plural = _("Conversion variants")

    def __str__(self) -> str:
        targets = ", ".join(t.name for t in self.targets.all())
        return f"{self.source} -> [{targets}]"
