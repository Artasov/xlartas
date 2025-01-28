# commerce/routes/api.py
from django.urls import path

from apps.software.controllers.software import (
    list_softwares, detail_software, list_software_products
)

urlpatterns = [
    # ...
    # Ниже добавляем
    path('software/', list_softwares),
    path('software/<int:pk>/', detail_software),
    path('software/<int:software_id>/products/', list_software_products),
]
