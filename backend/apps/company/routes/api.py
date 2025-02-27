# company/routes/api.py
from django.urls import path

from apps.company.controllers import (
    get_company_public_documents, get_company_document_detail,
    get_company_detail
)

urlpatterns = [
    path('companies/<str:name>/', get_company_detail),
    path('companies/<str:name>/docs/', get_company_public_documents),
    path('docs/<int:id>/', get_company_document_detail),
]
