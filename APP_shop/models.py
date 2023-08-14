from datetime import datetime, timedelta

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from Core.models import File, User


def get_count_license_days(license_type: str) -> int:
    if license_type == LicenseType.week:
        return 7
    elif license_type == LicenseType.month:
        return 30
    elif license_type == LicenseType.half_year:
        return 183
    elif license_type == LicenseType.year:
        return 365
    elif license_type == LicenseType.forever:
        return 9999


class LicenseType(models.TextChoices):
    week = 'week', _('week')
    month = 'month', _('month')
    half_year = 'half_year', _('half_year')
    year = 'year', _('year')
    forever = 'forever', _('forever')


class Product(models.Model):
    class ProductType(models.TextChoices):
        program = 'program', _('program')
        account = 'account', _('account')

    type = models.CharField(max_length=20, choices=ProductType.choices, default=ProductType.account)
    name = models.CharField(max_length=50)
    long_name = models.CharField(max_length=100, blank=True)
    version = models.CharField(max_length=5, blank=True)
    img = models.ImageField(upload_to='products/%Y/%m/%d', blank=True)
    sale = models.IntegerField(default=0)
    desc = models.TextField(blank=True)
    desc_short = models.CharField(max_length=100, null=True, blank=True)
    review_ulr = models.CharField(max_length=200, null=True, blank=True)
    available = models.BooleanField(default=True)
    log_changes = models.TextField(blank=True, null=True)
    file = models.ForeignKey(File, on_delete=models.SET_NULL, null=True, blank=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    test_period_days = models.IntegerField(default=3)

    price_week = models.IntegerField(null=True, blank=True)
    price_month = models.IntegerField(null=True, blank=True)
    price_half_year = models.IntegerField(null=True, blank=True)
    price_year = models.IntegerField(null=True, blank=True)
    price_forever = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["type"]
        verbose_name_plural = "Products"

    def __str__(self):
        return f'{self.name}'



class Order(models.Model):
    class OrderType(models.TextChoices):
        PRODUCT = 'product', _('product')
        BALANCE = 'balance', _('balance')

    class OrderStatus(models.TextChoices):
        WAITING = 'waiting', _('waiting')
        DONE = 'done', _('done')
        PAID = 'paid', _('paid')
        REJECTED = 'rejected', _('rejected')
        EXPIRED = 'expired', _('expired')

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amountRub = models.DecimalField(decimal_places=2, max_digits=8)
    status = models.CharField(max_length=10, choices=OrderStatus.choices, default=OrderStatus.WAITING)
    is_complete = models.BooleanField(default=False)
    promo = models.ForeignKey('Promo', on_delete=models.SET_NULL, null=True, blank=True)
    desc = models.CharField(max_length=250, blank=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    license_type = models.CharField(max_length=20, choices=LicenseType.choices, blank=True, null=True)
    order_system_name = models.CharField(max_length=30, blank=True)
    order_id = models.CharField(max_length=30, blank=True)
    type = models.CharField(max_length=10, choices=OrderType.choices, default=OrderType.PRODUCT)
    pay_link = models.CharField(max_length=150, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date_created"]


class Subscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    is_test_period_activated = models.BooleanField(default=False, verbose_name='Is tested')
    count_starts = models.IntegerField(default=0, verbose_name='Starts')
    date_expiration = models.DateTimeField(blank=True, default=datetime.utcnow)

    def __str__(self):
        return f'{self.user} - {self.product}'


def NowPlus30Days():
    return datetime.utcnow() + timedelta(days=30)


class Promo(models.Model):
    class PromoType(models.TextChoices):
        sale = 'sale', _('sale')
        free = 'free', _('free')

    promo = models.CharField(max_length=50)
    used_by = models.ManyToManyField(User, blank=True, related_name='used_by')
    products = models.ManyToManyField(Product)
    promo_type = models.CharField(max_length=50, choices=PromoType.choices)
    promo_value = models.CharField(max_length=50)
    applys_now = models.IntegerField(default=0)
    applys_max = models.IntegerField(default=60)
    date_expiration = models.DateTimeField(default=NowPlus30Days)

    def __str__(self):
        return f'{self.promo}'
