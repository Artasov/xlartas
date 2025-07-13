# tbank/models.py
from adjango.models import AModel
from django.conf import settings
from django.db.models import (
    DateTimeField, ForeignKey, Model, CASCADE, SET_NULL,
    CharField, TextChoices, PositiveSmallIntegerField,
    DecimalField,
    PositiveBigIntegerField, BooleanField, EmailField, IntegerField, )
from django.db.models import OneToOneField
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.tbank.services.payment import TBankPaymentService
from apps.uuid6.field import UUIDv6Field
from .services.installment import TBankInstallmentService
from ..commerce.models import Payment


class TBankCustomer(AModel):
    from apps.tbank.managers.customer import TBankCustomerManager
    objects = TBankCustomerManager()
    user = OneToOneField(settings.AUTH_USER_MODEL, SET_NULL, null=True, verbose_name=_('User'))
    key = UUIDv6Field(_('Customer key'), blank=True, null=True)

    class Meta:
        verbose_name = _('TBank customer')
        verbose_name_plural = _('TBank customers')


class TBankPayment(Payment):
    class Status(TextChoices):
        NEW = 'NEW', 'NEW'
        FORM_SHOWED = 'FORM_SHOWED', 'FORM_SHOWED'
        AUTHORIZING = 'AUTHORIZING', 'AUTHORIZING'
        CHECKING_3DS = '3DS_CHECKING', '3DS_CHECKING'
        CHECKED_3DS = '3DS_CHECKED', '3DS_CHECKED'
        AUTHORIZED = 'AUTHORIZED', 'AUTHORIZED'
        CONFIRMING = 'CONFIRMING', 'CONFIRMING'
        CONFIRMED = 'CONFIRMED', 'CONFIRMED'
        REVERSING = 'REVERSING', 'REVERSING'
        PARTIAL_REVERSED = 'PARTIAL_REVERSED', 'PARTIAL_REVERSED'
        REVERSED = 'REVERSED', 'REVERSED'
        REFUNDING = 'REFUNDING', 'REFUNDING'
        PARTIAL_REFUNDED = 'PARTIAL_REFUNDED', 'PARTIAL_REFUNDED'
        REFUNDED = 'REFUNDED', 'REFUNDED'
        CANCELED = 'CANCELED', 'CANCELED'
        DEADLINE_EXPIRED = 'DEADLINE_EXPIRED', 'DEADLINE_EXPIRED'
        REJECTED = 'REJECTED', 'REJECTED'
        AUTH_FAIL = 'AUTH_FAIL', 'AUTH_FAIL'

    class Source(TextChoices):
        CARDS = 'cards', 'Cards'
        TINKOFF_PAY = 'TinkoffPay', 'TinkoffPay'
        TINKOFF_WALLET = 'TinkoffWallet', 'TinkoffWallet'
        QRSBP = 'qrsbp', 'СБП'
        YANDEX_PAY = 'YandexPay', 'YandexPay'

    customer = ForeignKey(TBankCustomer, SET_NULL, null=True, verbose_name=_('Customer'))
    order_id = UUIDv6Field(_('Order ID'), unique=True)
    status = CharField(max_length=20, choices=Status.choices, default=Status.NEW, verbose_name=_('Status'))
    source = CharField(max_length=20, choices=Source.choices, verbose_name=_('Source'))
    commission = DecimalField(_('Commission'), max_digits=10, decimal_places=2, default=0.0)
    card_id = IntegerField(verbose_name=_('Card ID'), null=True, blank=True)
    user_agent = CharField(max_length=500, verbose_name=_('User agent'), null=True, blank=True)
    real_timezone = CharField(max_length=10, verbose_name=_('Real timezone'), null=True, blank=True)
    device = CharField(max_length=20, verbose_name=_('Device'), null=True, blank=True)
    device_os = CharField(max_length=20, verbose_name=_('Device OS'), null=True, blank=True)
    device_browser = CharField(max_length=20, verbose_name=_('Device browser'), null=True, blank=True)

    class Meta:
        verbose_name = _('TBank payment')
        verbose_name_plural = _('TBank payments')

    @property
    def service(self) -> TBankPaymentService:
        return TBankPaymentService(self)

    def __str__(self):
        return f'TBankPayment:{self.id}'


class TBankRecurringPayment(AModel):
    customer = ForeignKey(TBankCustomer, CASCADE, verbose_name=_('Customer'))
    payment = OneToOneField(TBankPayment, CASCADE, verbose_name=_('Payment'))
    rebillid = PositiveBigIntegerField(unique=True, verbose_name=_('Rebill ID'))
    next_payment_date = DateTimeField(verbose_name=_('Next payment date'))
    interval_days = PositiveSmallIntegerField(verbose_name=_('Interval days'))

    async def schedule_next_payment(self):
        self.next_payment_date = timezone.now() + timezone.timedelta(days=self.interval_days)
        await self.asave()

    class Meta:
        verbose_name = _('TBank recurring payment')
        verbose_name_plural = _('TBank recurring payments')


class TBankInstallmentStatus(TextChoices):
    NEW = 'new', 'new'
    INPROGRESS = 'inprogress', 'inprogress'
    APPROVED = 'approved', 'approved'
    SIGNED = 'signed', 'signed'
    CANCELED = 'canceled', 'canceled'
    REJECTED = 'rejected', 'rejected'


class TBankInstallmentException:
    pass


class TBankInstallment(Payment, TBankInstallmentService, TBankInstallmentException):
    """
    Модель «Payment» для рассрочки в Tinkoff Forma
    (аналог TBankPayment, но для 'Forma'-рассрочки).
    """
    # Аналогично TBankPayment: order_id = UUIDv6Field
    order_id = UUIDv6Field(_('Installment Order ID'), unique=True)
    status = CharField(
        max_length=20,
        choices=TBankInstallmentStatus.choices,
        default=TBankInstallmentStatus.NEW,
        verbose_name=_('Installment Status')
    )
    chosen_bank = CharField(_('Chosen Bank'), max_length=100, null=True, blank=True)
    committed = BooleanField(default=False, verbose_name=_('Committed'))
    is_demo = BooleanField(default=False, verbose_name=_('Is demo installment available'))
    tinkoff_internal_id = CharField(
        _('Tinkoff Form ID'), max_length=128,
        null=True, blank=True, unique=False
    )
    external_order_number = CharField(
        _('External order number'), max_length=128,
        null=True, blank=True
    )
    created_at_tinkoff = DateTimeField(
        _('Tinkoff created_at'), null=True, blank=True
    )
    product_type = CharField(
        _('Product type from Tinkoff'), max_length=50, null=True, blank=True
    )  # 'credit' or 'installment_credit'
    term = PositiveSmallIntegerField(_('Credit term (months)'), null=True, blank=True)
    monthly_payment = DecimalField(
        _('Monthly payment'), max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    first_name = CharField(_('Client first name'), max_length=100, null=True, blank=True)
    last_name = CharField(_('Client last name'), max_length=100, null=True, blank=True)
    middle_name = CharField(_('Client middle name'), max_length=100, null=True, blank=True)
    phone = CharField(_('Client phone'), max_length=30, null=True, blank=True)
    email = EmailField(_('Client email'), null=True, blank=True)
    loan_number = CharField(_('Loan number'), max_length=100, null=True, blank=True)
    signing_type = CharField(_('Signing type'), max_length=50, null=True, blank=True)
    expected_overdue_at = DateTimeField(_('Expected overdue at'), null=True, blank=True)
    # Суммы
    order_amount = DecimalField(
        _('Order amount'), max_digits=10, decimal_places=2,
        null=True, blank=True, help_text='В копейках'
    )
    credit_amount = DecimalField(
        _('Credit amount'), max_digits=10, decimal_places=2,
        null=True, blank=True, help_text='В копейках'
    )
    transfer_amount = DecimalField(
        _('Transfer amount'), max_digits=10, decimal_places=2,
        null=True, blank=True, help_text='В копейках'
    )
    first_payment = DecimalField(
        _('First payment'), max_digits=10, decimal_places=2,
        null=True, blank=True
    )

    class Meta:
        verbose_name = _('TBank installment payment')
        verbose_name_plural = _('TBank installment payments')

    def __str__(self):
        return f'TBankInstallment #{self.order_id} status={self.status}'
