from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('commerce', '0008_alter_order_currency_alter_order_payment_system'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='payment_system',
            field=models.CharField(
                choices=[('handmade', 'HandMade'), ('tbank', 'TBank'), ('tbank_installment', 'Tinkoff (Installment)'),
                         ('cloud_payment', 'CloudPayments'), ('freekassa', 'FreeKassa')],
                default='handmade', max_length=50, db_index=True, verbose_name='Payment System'
            ),
            preserve_default=False,
        ),
    ]
