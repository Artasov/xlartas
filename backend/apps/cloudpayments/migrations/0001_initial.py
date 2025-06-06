# Generated by Django 5.1.6 on 2025-05-12 17:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('commerce', '0003_alter_order_payment_system'),
    ]

    operations = [
        migrations.CreateModel(
            name='CloudPaymentPayment',
            fields=[
                ('payment_ptr',
                 models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True,
                                      primary_key=True, serialize=False, to='commerce.payment')),
                ('transaction_id', models.BigIntegerField(unique=True, verbose_name='CloudPayments transaction id')),
                ('status', models.CharField(
                    choices=[('Created', 'Created'), ('Authorized', 'Authorized'), ('Completed', 'Completed'),
                             ('Declined', 'Declined'), ('Refunded', 'Refunded')], db_index=True, max_length=20,
                    verbose_name='Status')),
            ],
            options={
                'verbose_name': 'CloudPaymentAPI',
                'verbose_name_plural': 'CloudPayments',
            },
            bases=('commerce.payment',),
        ),
    ]
