# software/routes/api.py
from django.urls import path

from apps.software.controllers.license import get_license_hours, list_user_licenses
from apps.software.controllers.software import (
    list_softwares, detail_software
)

urlpatterns = [
    path('software/', list_softwares),
    path('software/<int:pk>/', detail_software),
    path('software/<int:software_id>/license-hours/', get_license_hours),
    path('software/licenses/', list_user_licenses),
]
