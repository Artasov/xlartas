# commerce/routes/api.py
from django.urls import path

from apps.commerce.controllers.balance import (
    get_latest_balance_product, user_balance
)
from apps.commerce.controllers.employee_availability import EmployeeAvailabilityViewSet
from apps.commerce.controllers.gift_certificate import activate_gift_certificate
from apps.commerce.controllers.order import (
    order_detail, user_orders, order_cancel,
    order_execute, resend_payment_notification,
    order_init, create_order, order_delete
)
from apps.commerce.controllers.payment import init_payment
from apps.commerce.controllers.product import payment_types
from apps.commerce.controllers.promocode import is_promocode_applicable

app_name = 'commerce'
employee_availability_list = EmployeeAvailabilityViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

employee_availability_detail = EmployeeAvailabilityViewSet.as_view({
    'put': 'update',
    'delete': 'destroy'
})

urlpatterns = [
    path('orders/create/', create_order),
    path('orders/<str:id>/init/<int:init_payment>/', order_init),
    path('user/orders/', user_orders),
    path('user/balance/', user_balance),
    path('orders/<str:id>/', order_detail),
    path('orders/<str:id>/cancel/', order_cancel),
    path('orders/<str:id>/execute/', order_execute),
    path('orders/<str:id>/delete/', order_delete),
    path('orders/<str:id>/init-payment/', init_payment),
    path('orders/<str:id>/resend_payment_notification/', resend_payment_notification),
    path('employee/availability/', employee_availability_list),
    path('employee/availability/<int:pk>/', employee_availability_detail),
    path('payment/types/', payment_types),

    path('balance/product/latest/', get_latest_balance_product),

    path('promocode/applicable/', is_promocode_applicable),

    path('gift-certificate/activate/', activate_gift_certificate)
]
