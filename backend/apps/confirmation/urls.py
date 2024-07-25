from django.urls import path

from apps.confirmation.controllers.base import confirm_code, new_confirm_code

urlpatterns = [
    path('confirm-code/', confirm_code, name='confirm_code'),
    path('generate-confirm-code/', new_confirm_code, name='confirm_code_generate'),
]
