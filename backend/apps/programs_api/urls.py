from django.urls import path

from . import views

urlpatterns = [  # /api/v1/
    path('login_program/', views.login_program, name='login_program'),
    path('set_hw_id/', views.set_hw_id, name='set_hw_id'),
    path('get_product_version/<str:software>/', views.get_product_version, name='get_product_version'),
]
