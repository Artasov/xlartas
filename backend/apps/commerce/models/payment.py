# commerce/models/payment.py

from adjango.models import AModel
from adjango.models import APolymorphicModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import URLField, TextChoices, CharField, DecimalField, ForeignKey, SET_NULL, BooleanField
from django.utils.translation import gettext_lazy as _


class Currency(TextChoices):
    USD = 'USD', _('US Dollar')
    RUB = 'RUB', _('Russian Ruble')
    EUR = 'EUR', _('Euro')


class PaymentSystem(TextChoices):
    HandMade = 'handmade', _('HandMade')
    TBank = 'tbank', _('TBank')
    TBankInstallment = 'tbank_installment', _('Tinkoff (Installment)')
    CloudPayment = 'cloud_payment', _('CloudPayments')
    FreeKassa = 'freekassa', _('FreeKassa')
    Balance = 'balance', _('Balance')


class ACurrencyMixin(AModel):
    currency = CharField(verbose_name=_('Currency'), choices=Currency.choices, max_length=3)

    class Meta:
        abstract = True


class ACurrencyAmountMixin(AModel):
    amount = DecimalField(verbose_name=_('Amount'), max_digits=10, decimal_places=2)
    currency = CharField(verbose_name=_('Currency'), choices=Currency.choices, max_length=3)

    class Meta:
        abstract = True


class CurrencyPaymentSystemMapping:
    CURRENCY_TO_PAYMENT = {
        # 'USD': (PaymentSystem.Stripe,),
        # 'EUR': (PaymentSystem.Stripe,),
        'RUB': (
            PaymentSystem.TBank,
            PaymentSystem.TBankInstallment,
            PaymentSystem.CloudPayment,
            PaymentSystem.HandMade,
            PaymentSystem.FreeKassa,
            PaymentSystem.Balance,
        ),
    }

    @classmethod
    def get_payment(cls, currency: str) -> tuple[PaymentSystem, ...] | tuple:
        """Возвращает платежную систему для указанной валюты"""
        return cls.CURRENCY_TO_PAYMENT.get(currency, tuple())

    @classmethod
    def get_currencies(cls, payment: str) -> list[str]:
        """Возвращает список валют для указанной платежной системы"""
        return [currency for currency, system in cls.CURRENCY_TO_PAYMENT.items() if system == payment]


class Payment(
    APolymorphicModel,
    ACurrencyAmountMixin,
    ACreatedUpdatedAtIndexedMixin,
):
    user = ForeignKey('core.User', SET_NULL, 'payments', null=True, verbose_name=_('User'))
    payment_url = URLField(_('Payment URL'), max_length=500, blank=True, null=True)
    is_paid = BooleanField(default=False, db_index=True, verbose_name=_('Is paid'))

    def __str__(self):
        return f'Payment:{self.id}'

    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')


class BalancePayment(Payment):
    class Meta:
        verbose_name = _('Balance payment')
        verbose_name_plural = _('Balance payments')


class HandMadePayment(Payment):
    class Meta:
        verbose_name = _('Hand made payment')
        verbose_name_plural = _('Hand made payments')
