from django.urls import path

from apps.ckassa.controllers.api import notification

app_name = 'ckassa'

urlpatterns = [
    path('notification/', notification, name='notification'),
]
