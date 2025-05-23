# Generated by Django 5.1.6 on 2025-05-12 17:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('commerce', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='payment_system',
            field=models.CharField(
                choices=[('handmade', 'HandMade'), ('tbank', 'TBank'), ('tbank_installment', 'Tinkoff (Installment)'),
                         ('cloud_payment', 'CloudPayments')], db_index=True, max_length=50,
                verbose_name='Payment System'),
        ),
    ]
