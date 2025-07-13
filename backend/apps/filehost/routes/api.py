# filehost/routes/api.py
from django.urls import include, path

urlpatterns = [
    path('filehost/', include('apps.filehost.urls')),
]
