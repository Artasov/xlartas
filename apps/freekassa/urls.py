from django.urls import path

from . import views

app_name = 'freekassa'

urlpatterns = [
    path('payment/', views.payment_form, name='payment'),
    path('payment/notification/', views.payment_notification, name='payment_notification'),
]