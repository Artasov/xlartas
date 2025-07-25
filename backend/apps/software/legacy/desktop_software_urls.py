# software/legacy/desktop_software_urls.py
from django.urls import path

from apps.software.legacy.desktop_software_api import (
    software_auth,
    set_user_hw_id,
    get_software_version,
)

urlpatterns = [
    path('login_program/', software_auth, name='software_auth'),
    path('set_hw_id/', set_user_hw_id, name='set_user_hw_id'),
    path('get_product_version/<str:software_name>/', get_software_version, name='software_version'),
]
