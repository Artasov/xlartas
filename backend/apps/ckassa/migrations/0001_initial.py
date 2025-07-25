# Generated by Django 5.2.2 on 2025-07-07 16:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('commerce', '0011_alter_order_payment_system'),
    ]

    operations = [
        migrations.CreateModel(
            name='CKassaPayment',
            fields=[
                ('payment_ptr',
                 models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True,
                                      primary_key=True, serialize=False, to='commerce.payment')),
                ('reg_pay_num', models.CharField(blank=True, max_length=20, null=True, verbose_name='RegPayNum')),
                (
                    'status',
                    models.CharField(blank=True, db_index=True, max_length=20, null=True, verbose_name='Status')),
            ],
            options={
                'verbose_name': 'CKassa payment',
                'verbose_name_plural': 'CKassa payments',
            },
            bases=('commerce.payment',),
        ),
    ]
