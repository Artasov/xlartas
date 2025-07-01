from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('filehost', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='is_favorite',
            field=models.BooleanField(default=False),
        ),
    ]
