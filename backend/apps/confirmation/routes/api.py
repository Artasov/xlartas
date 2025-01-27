# confirmation/routes/api.py
from django.urls import path

from apps.confirmation.controllers.base import confirm_code, new_confirmation_code

app_name = 'confirmation'

urlpatterns = [
    path('confirm/', confirm_code, name='confirm_code'),
    path('new/', new_confirmation_code, name='new_confirmation_code'),
]
