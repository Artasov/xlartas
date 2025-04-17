# xlmine/models/base.py
from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtMixin
from django.db.models import FileField, CharField, TextField, DecimalField, JSONField
from django.utils.translation import gettext_lazy as _

from apps.xlmine.managers.privilege import PrivilegeManager
from apps.xlmine.services.privilege import PrivilegeService


class Launcher(ACreatedUpdatedAtMixin):
    file = FileField(upload_to='minecraft/launcher/', verbose_name=_('File'))
    version = CharField(max_length=500, verbose_name=_('Version'))
    sha256_hash = CharField(max_length=64, verbose_name=_('SHA256 Hash'), blank=True, null=True)

    def __str__(self): return f'Launcher {self.version}'

    def delete(self, *args, **kwargs):
        if self.file: self.file.delete(save=False)
        super().delete(*args, **kwargs)


class Release(ACreatedUpdatedAtMixin):
    file = FileField(upload_to='minecraft/core/', verbose_name=_('File'))
    version = CharField(max_length=500, verbose_name=_('Version'))
    sha256_hash = CharField(max_length=64, verbose_name=_('SHA256 Hash'), blank=True, null=True)
    security = JSONField(blank=True, null=True, verbose_name=_('Security manifest'))

    def __str__(self): return f'Release {self.version}'

    def delete(self, *args, **kwargs):
        if self.file: self.file.delete(save=False)
        super().delete(*args, **kwargs)


class Privilege(AModel, PrivilegeService):
    """
    Привилегия на сервере Minecraft. Порог threshold означает,
    что если сумма всех успешных донатов >= threshold,
    пользователь получает данную привилегию.
    """
    objects = PrivilegeManager()

    name = CharField(_('Name'), max_length=100, unique=True)
    # code_name = CharField(_('Code'), max_length=100, unique=True)
    code_name = CharField(_('Code'), max_length=100)
    # prefix = CharField(_('Prefix'), max_length=100, unique=True)
    prefix = CharField(_('Prefix'), max_length=100)
    color = CharField(_('Color'), max_length=10, unique=True)
    threshold = DecimalField(
        _('Donation threshold'), max_digits=10, decimal_places=2,
        help_text=_('Суммарная сумма донатов, начиная с которой эта привилегия доступна')
    )
    description = TextField(_('Description'), blank=True)

    class Meta:
        verbose_name = _('Privilege')
        verbose_name_plural = _('Privileges')

    def __str__(self): return f'Privilege {self.name} (threshold={self.threshold})'
