from django import forms
from django.conf import settings

from apps.shop.funcs import get_product_price_by_license_type, promo_validate
from apps.shop.models import LicenseType, Promo
from apps.Core.error_messages import CANNOT_CALC_PRICE, BALANCE_TO_SMALL, PROMOCODE_NOT_FOUND
from apps.Core.forms import FormWithRecaptchaValidator


class FormWithUser:
    def __init__(self, *args, **kwargs):
        if 'user' not in kwargs:
            raise ValueError("The 'user' argument is required")

        self.user = kwargs.pop('user')
        super().__init__(*args, **kwargs)


class DepositForm(FormWithUser, FormWithRecaptchaValidator):
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
    promo_code = forms.CharField(
        label='Promo',
        required=False,
        max_length=Promo._meta.get_field('code').max_length,
        widget=forms.TextInput(attrs={'placeholder': 'Promo'})
    )

    def clean(self):
        cleaned_data = super().clean()
        promo_code = cleaned_data.get('promo_code')
        if not promo_code:
            return cleaned_data
        try:
            promo_ = Promo.objects.get(code=promo_code)
        except Promo.DoesNotExist:
            raise forms.ValidationError(PROMOCODE_NOT_FOUND)
        validation = promo_validate(promo_, self.user.username)
        if isinstance(validation, dict) and 'invalid' in validation:
            raise forms.ValidationError(validation['invalid'])
        cleaned_data['promo'] = promo_
        return cleaned_data


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
        if price > int(user_.balance):
            raise forms.ValidationError(BALANCE_TO_SMALL.format(price - user_.balance))

        cleaned_data['price'] = price
        return cleaned_data
