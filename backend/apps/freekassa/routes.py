# freekassa/routes.py
from django.urls import path

from apps.freekassa.controllers.api import notification

app_name = 'freekassa'

urlpatterns = [
    path('notification/', notification, name='notification'),
]
