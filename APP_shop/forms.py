from django import forms
from django.conf import settings

from APP_shop.funcs import get_product_price_by_license_type, try_apply_promo
from APP_shop.models import LicenseType, Product
from Core.error_messages import CANNOT_CALC_PRICE, BALANCE_TO_SMALL
from Core.forms import FormWithRecaptchaValidator
from Core.models import User


class DepositForm(FormWithRecaptchaValidator):
    amount = forms.IntegerField(
        max_value=settings.MAX_DEPOSIT_AMOUNT,
        min_value=settings.MIN_DEPOSIT_AMOUNT,
        initial=settings.DEFAULT_DEPOSIT_AMOUNT,
        widget=forms.NumberInput(
            attrs={
                'placeholder': 'Amount',
                'style': 'padding-left: 15px;'
            }
        )
    )


class BuyProductProgramForm(FormWithRecaptchaValidator):
    license_type = forms.ChoiceField(choices=LicenseType.choices, required=True)
    def clean(self):
        cleaned_data = super().clean()
        product_ = self.data.get('product_')
        user_ = self.data.get('user_')
        price = get_product_price_by_license_type(
            product_, cleaned_data.get('license_type'))
        if not price:
            raise forms.ValidationError(CANNOT_CALC_PRICE)

        if price > user_.balance:
            forms.ValidationError(BALANCE_TO_SMALL.format(price - user_.balance))

        cleaned_data['price'] = price
        return cleaned_data
