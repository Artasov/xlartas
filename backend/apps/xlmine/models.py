# xlmine/models.py
import hashlib

from adjango.models import AModel
from adjango.models.mixins import ACreatedUpdatedAtMixin
from django.db.models import FileField, CharField
from django.utils.translation import gettext_lazy as _


def increment_version(version_str: str) -> str:
    try:
        parts = version_str.split('.')
        if len(parts) < 3:
            parts += ['0'] * (3 - len(parts))
        major, minor, patch = map(int, parts[:3])
        minor += 1
        return f"{major}.{minor}.{patch}"
    except Exception:
        return "1.0.0"


def calculate_sha256(file):
    hash_sha256 = hashlib.sha256()
    for chunk in file.chunks():
        hash_sha256.update(chunk)
    return hash_sha256.hexdigest()


class Launcher(ACreatedUpdatedAtMixin):
    file = FileField(upload_to='minecraft/launcher/', verbose_name=_('File'))
    version = CharField(max_length=500, verbose_name=_('Version'))
    sha256_hash = CharField(max_length=64, verbose_name=_('SHA256 Hash'), blank=True, null=True)


class Release(ACreatedUpdatedAtMixin):
    file = FileField(upload_to='minecraft/core/', verbose_name=_('File'))
    version = CharField(max_length=500, verbose_name=_('Version'))
    sha256_hash = CharField(max_length=64, verbose_name=_('SHA256 Hash'), blank=True, null=True)
