# Generated by Django 4.2.9 on 2024-03-21 00:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Core', '0003_alter_confirmationcode_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='discorduser',
            name='discord_id',
        ),
    ]