# commerce/admin/order.py
import logging

from adjango.utils.common import traceback_str
from asgiref.sync import async_to_sync
from django.contrib import admin, messages
from django.db import transaction
from django.db.models import QuerySet
from django.utils.translation import gettext_lazy as _
from import_export.admin import ImportExportModelAdmin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelFilter
from rest_framework.exceptions import APIException

from apps.commerce.models import BalanceProductOrder
from apps.commerce.models.order import (
    Order,
)
from apps.software.models import SoftwareOrder
from apps.xlmine.models import DonateOrder

log = logging.getLogger('commerce')


@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin, PolymorphicParentModelAdmin):
    base_model = Order
    child_models = (
        SoftwareOrder,
        BalanceProductOrder,
        DonateOrder,
    )

    list_display = (
        'id', 'user',
        'payment_system',
        'get_subclass',
        'created_at', 'updated_at',
        'is_inited', 'is_executed', 'is_paid', 'is_cancelled', 'is_refunded',
    )
    search_fields = (
        'user__username',
        'user__first_name',
        'user__last_name',
        'user__middle_name',
        'user__email',
    )
    list_filter = (
        'is_inited', 'is_executed', 'is_paid', 'is_cancelled', 'is_refunded',
        'payment_system', PolymorphicChildModelFilter
    )

    actions = (
        'init_without_payment',
        'init_with_payment',
        'execute',
        'cancel',
    )
    ordering = ('-created_at', '-updated_at',)

    @admin.display(description=_('Type'), ordering='polymorphic_ctype')
    def get_subclass(self, obj):
        return obj.get_real_instance().__class__.__name__

    def _handle_exception_message(self, request, order, e: Exception):
        # Логируем исключение
        log.error(f'Ошибка при обработке заказа {order.id}: {traceback_str(e)}')
        # Проверяем, есть ли в исключении detail и message
        if isinstance(e, APIException):
            detail = getattr(e, 'detail', None)
            if detail and isinstance(detail, dict) and 'message' in detail:
                # Если есть detail и в нем есть message, используем его
                self.message_user(
                    request,
                    f"Ошибка при обработке заказа {order.id}: {detail['message']}",
                    level=messages.ERROR,
                )
                return
        # Если нет detail или message - используем текст исключения
        self.message_user(request, f'Ошибка при обработке заказа {order.id}: {str(e)}', level=messages.ERROR)

    @admin.display(description=_('Init без оплаты'))
    def init_without_payment(self, request, queryset: QuerySet):
        with transaction.atomic():
            for order in queryset:
                log.info(f'Инициализация заказа {order.id} без оплаты')
                try:
                    async_to_sync(order.get_real_instance().service.init)(request, init_payment=False)
                except Exception as e:
                    self._handle_exception_message(request, order, e)
            self.message_user(request, 'Заказы успешно инициализированы без оплаты.')

    @admin.display(description=_('Init с оплатой'))
    def init_with_payment(self, request, queryset: QuerySet):
        with transaction.atomic():
            for order in queryset:
                log.info(f'Инициализация заказа {order.id} с оплатой')
                try:
                    async_to_sync(order.get_real_instance().service.init)(request)
                except Exception as e:
                    self._handle_exception_message(request, order, e)
            self.message_user(request, 'Заказы успешно инициализированы с оплатой.')

    @admin.display(description=_('Execute'))
    def execute(self, request, queryset: QuerySet):
        with transaction.atomic():
            for order in queryset:
                log.info(f'Исполнение заказа {order.id}')
                try:
                    async_to_sync(order.get_real_instance().service.execute)()
                except Exception as e:
                    self._handle_exception_message(request, order, e)
            self.message_user(request, 'Заказы успешно выполнены.')

    @admin.display(description=_('Отменить без оплаты'))
    def cancel(self, request, queryset: QuerySet):
        with transaction.atomic():
            for order in queryset:
                log.info(f'Отмена заказа {order.id}')
                try:
                    async_to_sync(order.get_real_instance().service.safe_cancel)(request, '')
                except Exception as e:
                    self._handle_exception_message(request, order, e)
            self.message_user(request, 'Заказы успешно отменены.')
