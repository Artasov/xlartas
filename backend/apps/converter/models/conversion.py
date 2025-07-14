# converter/models/conversion.py
from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import FileField, ForeignKey, CASCADE, CharField, BooleanField, JSONField
from django.utils.translation import gettext_lazy as _


class Conversion(ACreatedUpdatedAtIndexedMixin, AModel):
    user = ForeignKey('core.User', CASCADE, related_name='conversions', null=True, blank=True, verbose_name=_('User'))
    ip = CharField(max_length=64, verbose_name=_('IP'))
    input_file = FileField(upload_to='converter/input/', verbose_name=_('Input file'))
    output_file = FileField(upload_to='converter/output/', null=True, blank=True, verbose_name=_('Output file'))
    output_name = CharField(max_length=100, null=True, blank=True, verbose_name=_('Output name'))
    source_format = ForeignKey('converter.Format', CASCADE, related_name='+', verbose_name=_('Source format'))
    target_format = ForeignKey('converter.Format', CASCADE, related_name='+', verbose_name=_('Target format'))
    params = JSONField(blank=True, null=True, verbose_name=_('Parameters'))
    is_done = BooleanField(default=False, verbose_name=_('Is done'))

    class Meta:
        verbose_name = _('Conversion')
        verbose_name_plural = _('Conversions')

    def __str__(self) -> str:
        return f'{self.input_file.name} -> {self.target_format.name}'
