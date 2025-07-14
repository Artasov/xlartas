# converter/models/format.py
from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import CharField, ImageField
from django.utils.translation import gettext_lazy as _


class Format(ACreatedUpdatedAtIndexedMixin, AModel):
    name = CharField(max_length=50, unique=True, verbose_name=_('Name'))
    icon = ImageField(upload_to='converter/icons/', null=True, blank=True, verbose_name=_('Icon'))

    class Meta:
        verbose_name = _('Format')
        verbose_name_plural = _('Formats')

    def __str__(self) -> str: return self.name
