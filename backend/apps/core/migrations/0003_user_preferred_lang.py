# Generated by Django 5.2.2 on 2025-07-01 08:08

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_role_user_roles'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='preferred_lang',
            field=models.CharField(choices=[('ru', 'Русский'), ('en', 'English')], default='ru', max_length=2,
                                   verbose_name='Preferred language'),
        ),
    ]
