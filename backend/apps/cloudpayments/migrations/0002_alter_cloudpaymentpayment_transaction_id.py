# Generated by Django 5.1.6 on 2025-05-13 11:55

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('cloudpayments', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cloudpaymentpayment',
            name='transaction_id',
            field=models.BigIntegerField(default=None, null=True, verbose_name='CloudPayments transaction id'),
        ),
    ]
