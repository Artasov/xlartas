from django.urls import path

from . import views

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('<slug:slug>/', views.test, name='test'),
    path('create_test/', views.create_test, name='create_test'),
    path('create_question/<int:test_id>', views.create_question, name='create_question'),
]
