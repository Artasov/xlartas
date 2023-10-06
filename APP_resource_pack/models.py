from django.db import models
from django.utils.translation import gettext_lazy as _

from Core.models import User


class ResourcePackImage(models.Model):
    resource_pack = models.ForeignKey('ResourcePack', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='resource_pack_img/')

    def __str__(self):
        return f'{self.image.name}'


class ResourcePackComment(models.Model):
    resource_pack = models.ForeignKey('ResourcePack', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rp_comments')
    comment = models.TextField(max_length=500)



class ResourcePack(models.Model):
    class Resolution(models.TextChoices):
        addon = 'addon', _('Addon')
        x8 = 'x8', _('x8')
        x16 = 'x16', _('x16')
        x32 = 'x32', _('x32')
        x64 = 'x64', _('x64')
        x128 = 'x128', _('x128')
        x256 = 'x256', _('x256')
        x512 = 'x512', _('x512')
        other = 'other', _('other')

    class Style(models.TextChoices):
        dark = 'dark', _('dark')
        medium = 'medium', _('medium')
        light = 'light', _('light')
        other = 'other', _('other')

    class Color(models.TextChoices):
        white = 'white', _('white')
        black = 'black', _('black')
        red = 'red', _('red')
        blue = 'blue', _('blue')
        green = 'green', _('green')
        yellow = 'yellow', _('yellow')
        violet = 'violet', _('violet')
        other = 'other', _('other')

    name = models.CharField(max_length=20, unique=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rp')
    image_preview = models.ForeignKey(ResourcePackImage, on_delete=models.SET_NULL, null=True, related_name='rp')
    images = models.ManyToManyField(ResourcePackImage)
    file = models.FileField(upload_to='resource_pack_file/%Y/%m/%d')
    comments = models.ManyToManyField(ResourcePackComment, blank=True)
    available = models.BooleanField(default=True)
    slug = models.CharField(max_length=20, db_index=True, unique=True)

    style = models.CharField(max_length=20, choices=Style.choices, default=Style.other)
    color = models.CharField(max_length=20, choices=Color.choices, default=Color.other)
    resolution = models.CharField(max_length=20, choices=Resolution.choices, default=Resolution.other)

    likes = models.PositiveIntegerField(default=0)
    likes_by = models.ManyToManyField(User, blank=True)

    downloads = models.IntegerField(default=0)
    downloads_by = models.ManyToManyField(User, related_name='user_rp_downloads', blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name}'
