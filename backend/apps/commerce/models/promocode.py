# commerce/models/promocode.py
import random
import string

from adjango.fields import AManyToManyField
from adjango.models import AModel
from adjango.models.mixins import ACreatedAtIndexedMixin, ACreatedUpdatedAtIndexedMixin
from django.db.models import (
    DateTimeField, ForeignKey, CharField,
    PositiveSmallIntegerField, DecimalField, TextChoices,
    CASCADE, Index,
)
from django.utils.translation import gettext_lazy as _

from apps.commerce.services.promocode.base import PromoCodeService
from .payment import Currency
from ..exceptions.promocode import PromocodeException


def generate_promo_code(length=20):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


class PromocodeProductDiscount(AModel):
    """
    Модель отвечающая за цены по промокоду на конкретный товар,
    количество применений на пользователя, интервал между применениями,
    и опционально, доступ только конкретным пользователям.
    """
    amount = DecimalField(verbose_name=_('Discount amount'), max_digits=10, decimal_places=2, db_index=True)
    currency = CharField(
        verbose_name=_('Currency'), choices=Currency.choices,
        max_length=3, help_text='Not used for percentage discount promotional codes.', db_index=True)
    product = ForeignKey('commerce.Product', CASCADE, 'promocodes_discounts', verbose_name=_('Product'))
    # Общее, максимальное количество применений
    max_usage = PositiveSmallIntegerField(_('Max usage'), null=True, blank=True, db_index=True)
    # Максимальное число применений для конкретного пользователя
    max_usage_per_user = PositiveSmallIntegerField(_('Max usage per user'), null=True, blank=True, db_index=True)
    # Через сколько дней промокод снова можно будет применить для конкретного пользователя
    interval_days = PositiveSmallIntegerField(_('Interval days'), null=True, blank=True, db_index=True)
    # Если specific_users не заполнено, то промокод может быть применен любым пользователем
    specific_users = AManyToManyField('core.User', 'promo_codes',
                                      blank=True, verbose_name=_('Specific users'))

    class Meta:
        verbose_name = _('Promocode product discount'),
        verbose_name_plural = _('Promocode product discounts')

    def __str__(self):
        return f'[{self.amount}] {self.product} [{self.currency}]'


class Promocode(ACreatedUpdatedAtIndexedMixin, PromoCodeService, PromocodeException):
    class DiscountType(TextChoices):
        PERCENTAGE = 'percentage', _('Percentage')
        FIXED_AMOUNT = 'fixed_amount', _('Fixed amount')

    name = CharField(_('Name'), max_length=50, db_index=True)
    code = CharField(_('Code'), max_length=50, unique=True, default=generate_promo_code)
    description = CharField(_('Description'), max_length=255, blank=True, null=True)
    # На разные продукты действует по разному
    discounts = AManyToManyField(
        PromocodeProductDiscount, 'products_discounts',
        blank=True, verbose_name=_('Products discounts'))
    discount_type = CharField(_('Discount type'), max_length=20, choices=DiscountType.choices, db_index=True)
    # Дата начала действия промокода
    start_date = DateTimeField(_('Start date'), db_index=True)
    # Дата окончания действия промокода
    end_date = DateTimeField(_('End date'), null=True, blank=True, db_index=True)

    class Meta:
        verbose_name = _('Promocode')
        verbose_name_plural = _('Promocodes')

    def __str__(self):
        return f'{self.name} {self.code}'


class PromocodeUsage(ACreatedAtIndexedMixin):
    user = ForeignKey('core.User', CASCADE, 'promocode_usages')
    promocode = ForeignKey(Promocode, CASCADE, 'promocode_usages')

    class Meta:
        verbose_name = _('Promocode usage')
        verbose_name_plural = _('Promocode usages')
        indexes = [Index(fields=['user', 'promocode']), ]

    def __str__(self):
        return f'{self.promocode.code} used by {self.user.username} on {self.created_at}'
