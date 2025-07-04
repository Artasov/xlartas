# filehost/models.py
from adjango.models import AModel
from adjango.models.mixins import ACreatedAtMixin
from django.db.models import (
    Model, CharField, ForeignKey, CASCADE, BooleanField, FileField, ManyToManyField
)
from django.utils.crypto import get_random_string


class Folder(ACreatedAtMixin):
    name = CharField(max_length=255)
    user = ForeignKey('core.User', related_name='folders', on_delete=CASCADE)
    parent = ForeignKey('self', null=True, blank=True, related_name='subfolders', on_delete=CASCADE)
    tags = ManyToManyField('Tag', through='FolderTag')

    def __str__(self):
        return self.name


class File(ACreatedAtMixin):
    name = CharField(max_length=255)
    file = FileField(upload_to='files/')
    user = ForeignKey('core.User', related_name='files', on_delete=CASCADE)
    folder = ForeignKey(Folder, null=True, blank=True, related_name='files', on_delete=CASCADE)
    is_favorite = BooleanField(default=False)
    tags = ManyToManyField('Tag', through='FileTag')

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = self.file.name
        super().save(*args, **kwargs)

    def __str__(self): return self.name


class Tag(ACreatedAtMixin):
    name = CharField(max_length=255)
    user = ForeignKey('core.User', related_name='tags', on_delete=CASCADE)
    color = CharField(max_length=9, default='#ffffff')

    def __str__(self): return self.name


class FileTag(ACreatedAtMixin):
    file = ForeignKey(File, related_name='file_tags', on_delete=CASCADE)
    tag = ForeignKey(Tag, related_name='file_tags', on_delete=CASCADE)


class FolderTag(ACreatedAtMixin):
    folder = ForeignKey(Folder, related_name='folder_tags', on_delete=CASCADE)
    tag = ForeignKey(Tag, related_name='folder_tags', on_delete=CASCADE)


class Access(ACreatedAtMixin):
    folder = ForeignKey(Folder, related_name='accesses', on_delete=CASCADE, null=True, blank=True)
    file = ForeignKey(File, related_name='accesses', on_delete=CASCADE, null=True, blank=True)
    user = ForeignKey('core.User', related_name='accesses', on_delete=CASCADE, null=True, blank=True)
    email = CharField(max_length=255, null=True, blank=True)
    is_public = BooleanField(default=False)
    public_link = CharField(max_length=255, blank=True, null=True, unique=True)

    def save(self, *args, **kwargs):
        if self.is_public and not self.public_link:
            self.public_link = get_random_string(12)
        super().save(*args, **kwargs)

    def __str__(self):
        owner = self.user.email if self.user else self.email
        return f"Access to {'folder' if self.folder else 'file'} by {owner}"
