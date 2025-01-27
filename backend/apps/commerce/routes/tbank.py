# commerce/routes/tbank.py
from django.urls import path

from apps.commerce.controllers.tbank.installment_notification import installment_notification
from apps.commerce.controllers.tbank.notification import notification

app_name = 'tbank'
urlpatterns = [
    path('notification/', notification, name='notification'),
    path('is_installment_available/notification/', installment_notification, name='installment_notification'),
]
