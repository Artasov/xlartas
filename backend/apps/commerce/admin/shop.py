# commerce/admin/shop.py
from adjango.decorators import admin_description, admin_order_field
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from import_export.admin import ImportExportModelAdmin
from polymorphic.admin import PolymorphicChildModelAdmin, PolymorphicParentModelAdmin

from apps.cloudpayments.models import CloudPaymentPayment
from apps.commerce.models import Payment, Currency, Product, HandMadePayment, BalancePayment
from apps.commerce.models.product import ProductPrice
from apps.freekassa.models import FreeKassaPayment
from apps.tbank.models import TBankPayment


class ProductPriceInline(admin.TabularInline):
    model = ProductPrice
    extra = 1  # Количество дополнительных пустых полей для добавления новых цен


@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin):
    list_display = ('name', 'get_default_price', 'is_available', 'is_installment_available', 'created_at', 'updated_at')
    list_editable = ('is_installment_available',)
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')
    inlines = [ProductPriceInline]
    actions = (
        'make_installment_available',
        'make_installment_unavailable'
    )

    @admin_description(_('Default Price'))
    def get_default_price(self, obj):
        """Отображаем цену в валюте, установленной по умолчанию"""
        default_currency = Currency.RUB
        return obj.get_price(default_currency)

    @admin.action(description=_('Set installments available'))
    def make_installment_available(self, request, queryset):
        """Устанавливает is_installment_available=True для выбранных продуктов"""
        updated_count = queryset.update(is_installment_available=True)
        self.message_user(request, f'Успешно обновлено {updated_count} записей: рассрочка теперь доступна.')

    @admin.action(description=_('Set installments unavailable'))
    def make_installment_unavailable(self, request, queryset):
        """Устанавливает is_installment_available=False для выбранных продуктов"""
        updated_count = queryset.update(is_installment_available=False)
        self.message_user(request, f'Успешно обновлено {updated_count} записей: рассрочка теперь недоступна.')


@admin.register(ProductPrice)
class ProductPriceAdmin(ImportExportModelAdmin):
    list_display = ('product', 'currency', 'amount', 'exponent', 'offset')
    list_editable = ('amount', 'exponent', 'offset')
    search_fields = ('product__name', 'currency')
    list_filter = ('currency',)


class PaymentChildAdmin(PolymorphicChildModelAdmin):
    base_model = Payment


@admin.register(Payment)
class PaymentParentAdmin(PolymorphicParentModelAdmin):
    base_model = Payment
    child_models = (
        TBankPayment,
        HandMadePayment,
        BalancePayment,
        CloudPaymentPayment,
        FreeKassaPayment
    )
    list_display = (
        'id', 'user',
        'amount', 'currency',
        'is_paid',
        'get_subclass',
        'payment_url',
        'created_at', 'updated_at'
    )

    @admin_description(_('Type'))
    @admin_order_field('polymorphic_ctype')
    def get_subclass(self, obj):
        return obj.get_real_instance().__class__.__name__


@admin.register(HandMadePayment)
class HandMadePaymentAdmin(PolymorphicChildModelAdmin):
    base_model = HandMadePayment
    show_in_index = True
    list_display = ('__str__', 'amount', 'currency', 'payment_url', 'created_at', 'updated_at')
    search_fields = ('payment_url',)
    list_filter = ('currency',)
