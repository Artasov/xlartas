from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('converter', '0002_parameter_default_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversion',
            name='output_name',
            field=models.CharField(max_length=100, null=True, blank=True, verbose_name='Output name'),
        ),
    ]

