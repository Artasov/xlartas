from django.urls import path

from . import views

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('buy/', views.buy, name='buy'),
    path('balance_increase/', views.balance_increase, name='balance_increase'),
    path('orders/', views.orders, name='orders'),
    path('qiwi_hook/', views.qiwi_hook, name='qiwi_hook'),
    path('product_program/<str:program_name>', views.product_program, name='product_program'),
    path('activate_test_period/', views.activate_test_period, name='activate_test_period'),
    path('download_program/<int:product_id>/', views.download_program, name='download_program'),
]
