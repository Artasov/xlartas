from datetime import timedelta
from typing import TypedDict

from django.db.models import (
    TextField, ForeignKey, Model, CharField,
    ImageField, IntegerField, BooleanField,
    ManyToManyField, CASCADE,
    PositiveSmallIntegerField, SET_NULL,
    DateTimeField, TextChoices, DecimalField, PositiveIntegerField,
)
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.Core.models.common import File
from apps.Core.models.user import User


class SoftwareProductInfo(TypedDict):
    id: int
    name: str
    long_name: str
    version: str
    img: str
    discount: int
    desc: str
    desc_short: str
    review_url: str
    is_available: bool
    log_changes: str
    file: str
    updated_at: int
    test_period_days: int
    starts: int
    subscriptions: list[dict]


class SoftwareProduct(Model):
    name = CharField(max_length=50)
    long_name = CharField(max_length=100, blank=True)
    version = CharField(max_length=5, blank=True)
    img = ImageField(upload_to='images/products', blank=True)
    discount = IntegerField(default=0)
    desc = TextField(blank=True)
    desc_short = CharField(max_length=100, null=True, blank=True)
    review_url = CharField(max_length=200, null=True, blank=True)
    is_available = BooleanField(default=True)
    log_changes = TextField(blank=True, null=True)
    file = ForeignKey(File, on_delete=SET_NULL, null=True, blank=True)
    test_period_days = IntegerField(default=3)

    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Software"

    def __str__(self):
        return f'{self.name}'


class SubscriptionTimeCategory(Model):
    name = CharField(max_length=30)
    hours = PositiveSmallIntegerField()

    def __str__(self):
        return f'{self.name}'


class SoftwareSubscription(Model):
    name = CharField(max_length=30)
    software = ForeignKey(SoftwareProduct, on_delete=CASCADE, related_name='subscriptions')
    time_category = ForeignKey(SubscriptionTimeCategory, on_delete=CASCADE)
    amount = PositiveIntegerField()


class SoftwareSubscriptionInfo(TypedDict):
    id: int
    name: str
    software: int
    hours: int
    amount: int


class UserSoftwareSubscription(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    software = ForeignKey(SoftwareProduct, on_delete=CASCADE)
    is_test_period_activated = BooleanField(default=False, verbose_name='Is tested')
    starts = IntegerField(default=0, verbose_name='Starts')
    last_activity = DateTimeField(default=timezone.now)
    expires_at = DateTimeField(blank=True, default=timezone.now)

    def __str__(self):
        return f'{self.user} - {self.software}'


def NowPlus30Days():
    return timezone.now() + timedelta(days=30)


class PromoGroup(Model):
    name = CharField(max_length=150)

    def __str__(self):
        return f'{self.name}'


class Promo(Model):
    class PromoType(TextChoices):
        DISCOUNT = 'discount', _('Discount')
        BALANCE = 'balance', _('Balance')

    code = CharField(max_length=50, unique=True)
    group = ForeignKey(
        PromoGroup, on_delete=SET_NULL, null=True, blank=True
    )
    used_by = ManyToManyField(User, blank=True, related_name='used_promo')
    type = CharField(max_length=50, choices=PromoType.choices)
    value = IntegerField()
    applys_now = IntegerField(default=0)
    applys_max = IntegerField(default=60)
    expires_at = DateTimeField(default=NowPlus30Days)

    def __str__(self):
        return f'{self.code}'


class BaseOrder(Model):
    class OrderTypes(TextChoices):
        DEPOSIT = 'deposit', 'Deposit'
        SOFTWARE = 'software', 'Software'

    user = ForeignKey(User, on_delete=CASCADE)
    amount = DecimalField(max_digits=10, decimal_places=2)
    type = CharField(max_length=100, choices=OrderTypes.choices)
    promo = ForeignKey(Promo, on_delete=SET_NULL, null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    is_completed = BooleanField(default=False)

    class Meta:
        abstract = True


class SoftwareSubscriptionOrder(BaseOrder):
    software = ForeignKey(SoftwareProduct, on_delete=SET_NULL, null=True)

    class Meta:
        ordering = ["created_at"]
