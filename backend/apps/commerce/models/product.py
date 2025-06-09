# commerce/models/product.py
from decimal import Decimal

from adjango.models import APolymorphicModel
from adjango.models.mixins import ACreatedUpdatedAtIndexedMixin
from django.db.models import CharField, TextField, ForeignKey, CASCADE, BooleanField, DecimalField
from django.utils.translation import gettext_lazy as _
from imagekit.models import ProcessedImageField
from pilkit.processors import ResizeToFit

from apps.commerce.models.payment import ACurrencyAmountMixin
from utils.pictures import CorrectOrientation


class Product(APolymorphicModel, ACreatedUpdatedAtIndexedMixin):
    name = CharField(verbose_name=_('Name'), max_length=255, db_index=True)
    pic = ProcessedImageField(
        verbose_name=_('Picture'),
        upload_to='product/pictures/',
        processors=(ResizeToFit(500, 500), CorrectOrientation()),
        format='JPEG', options={'quality': 100},
        null=True, blank=True
    )
    description = TextField(verbose_name=_('Description'), max_length=4096, null=True, blank=True)
    short_description = TextField(verbose_name=_('Short description'), max_length=4096, null=True, blank=True)
    is_available = BooleanField(verbose_name=_('Is available'), default=True)
    is_installment_available = BooleanField(verbose_name=_('Is installment available'), default=False)

    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')

    def __str__(self):
        return self.name

    async def aget_price(self, currency) -> Decimal | None:
        price = await self.prices.agetorn(currency=currency)  # noqa
        return price.amount if price else None

    def get_price(self, currency) -> Decimal | None:
        try:
            return self.prices.get(currency=currency)  # noqa
        except ProductPrice.DoesNotExist:
            return None


class ProductPrice(ACurrencyAmountMixin):
    product = ForeignKey(Product, CASCADE, 'prices', verbose_name=_('Product'))
    exponent = DecimalField(
        verbose_name=_('Exponent'), max_digits=10,
        decimal_places=2, default=None, null=True, blank=True
    )
    offset = DecimalField(
        verbose_name=_('Offset'), max_digits=10,
        decimal_places=2, default=None, null=True, blank=True
    )

    class Meta:
        verbose_name = _('Product Price')
        verbose_name_plural = _('Product Prices')
        unique_together = ('product', 'currency')

    def __str__(self):
        return f"{self.product.name} - {self.amount} {self.currency}"
