from django.urls import path

from apps.freekassa.controllers import fk_notify, fk_success, fk_failed, create_deposit

app_name = 'freekassa'

urlpatterns = [
    path('deposit/', create_deposit, name='create_deposit'),
    path('pay/fk-notify/', fk_notify, name='fk-notify'),
    path('pay/fk-success/', fk_success, name='fk-success'),
    path('pay/fk-failed/', fk_failed, name='fk-failed'),
]
