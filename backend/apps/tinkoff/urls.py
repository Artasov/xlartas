# tinkoff/urls.py
from django.urls import path

from apps.tinkoff.controllers.base import create_tinkoff_deposit_order, tinkoff_pay_form
from apps.tinkoff.controllers.notify import notify

urlpatterns = [
    # path('tinkoff-deposit/', create_tinkoff_deposit_order, name='tinkoff_deposit'),
    path('deposit/', tinkoff_pay_form, name='tinkoff_deposit'),
    path('notify/', notify, name='tinkoff_notify'),
]
