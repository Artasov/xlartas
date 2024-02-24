from django.urls import path
from . import views

urlpatterns = [
    path('', views.create, name='create'),
    path('uploads/', views.list_user_upload, name='list'),
    path('<str:key>/', views.read, name='read'),
    path('<str:key>/delete/', views.delete, name='delete'),
]
