# Generated by Django 5.2.2 on 2025-07-01 12:36

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('mailing', '0002_mailing_sent_users'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='mailing',
            name='html_content',
            field=models.TextField(help_text='Use HTML for formatting (color, fat text, pictures, etc.)',
                                   verbose_name='HTML content'),
        ),
        migrations.AlterField(
            model_name='mailing',
            name='sent_users',
            field=models.ManyToManyField(blank=True, help_text='Users who have already been sent a letter',
                                         related_name='mailings_received', to=settings.AUTH_USER_MODEL,
                                         verbose_name='Sent users'),
        ),
        migrations.AlterField(
            model_name='mailing',
            name='subject',
            field=models.CharField(max_length=255, verbose_name='Theme'),
        ),
    ]
