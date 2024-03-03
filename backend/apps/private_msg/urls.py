from django.urls import path

from . import views

urlpatterns = [
    path('', views.create, name='create'),
    path('<str:key>/', views.preread, name='preread'),
    path('<str:key>/read/', views.read, name='read'),
]
