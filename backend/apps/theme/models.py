# theme/models.py
from adjango.models import AModel
from django.db.models import (
    Model, TextChoices, CharField, ImageField, BooleanField
)
from django.utils.translation import gettext_lazy as _


class Theme(AModel):
    class Mode(TextChoices):
        LIGHT = 'light', _('Light')
        DARK = 'dark', _('Dark')

    name = CharField(max_length=100, verbose_name=_('Name'))
    mode = CharField(max_length=10, choices=Mode.choices, verbose_name=_('Mode'))
    bg_image = ImageField(upload_to='images/theme/background/',
                          null=True, blank=True,
                          verbose_name=_('Background Image'))
    is_default = BooleanField(default=False, verbose_name=_('Is Default'))

    class Meta:
        verbose_name = _('Theme')
        verbose_name_plural = _('Themes')
