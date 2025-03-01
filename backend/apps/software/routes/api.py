# software/routes/api.py
from django.urls import path

from apps.software.controllers.license import list_user_licenses, license_current_user
from apps.software.controllers.software import (
    list_softwares, detail_software, activate_test_period
)

urlpatterns = [
    path('software/', list_softwares),
    path('software/<int:software_id>/', detail_software),
    path('software/<int:software_id>/activate-test-period/', activate_test_period),
    path('software/licenses/', list_user_licenses),
    path('license/<int:software_id>/', license_current_user),
]
