# Generated by Django 5.0.6 on 2024-06-01 03:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('confirmation', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='confirmationcode',
            name='action',
            field=models.CharField(choices=[('signup', 'Sign Up'), ('reset_password', 'Reset Password'), ('survey_access', 'Survey Access'), ('auto_created_user', 'Auto Created User')], max_length=20),
        ),
    ]