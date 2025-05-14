# cloudpayments/routes.py
from django.urls import path

from apps.cloudpayments.controllers.api import success
from apps.cloudpayments.views import pay

app_name = 'cloudpayments'

urlpatterns = [
    path('pay/<uuid:order_id>/', pay, name='pay'),
    path('success/', success, name='success'),
]
