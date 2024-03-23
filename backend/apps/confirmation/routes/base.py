from django.urls import path

from apps.confirmation.controllers.base import confirm_code, new_confirm_code

urlpatterns = [
    path('api/confirm-code/', confirm_code, name='confirm_code'),
    path('api/generate-confirm-code/', new_confirm_code, name='confirm_code_generate'),
]
