# Generated by Django 5.1.6 on 2025-04-17 23:59

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('xlmine', '0014_remove_privilege_color_alter_privilege_prefix'),
    ]

    operations = [
        migrations.AddField(
            model_name='userxlmine',
            name='cape',
            field=models.FileField(blank=True, null=True, upload_to='minecraft/capes/', verbose_name='Cape'),
        ),
        migrations.AddField(
            model_name='userxlmine',
            name='skin',
            field=models.FileField(blank=True, null=True, upload_to='minecraft/skins/', verbose_name='Skin'),
        ),
    ]
