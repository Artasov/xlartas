from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('converter', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='parameter',
            name='default_value',
            field=models.CharField(blank=True, null=True, max_length=100, verbose_name='Default value'),
        ),
    ]
