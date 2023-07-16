from django.urls import path

from . import views

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('buy/', views.buy, name='buy'),
    path('bills/', views.bills, name='bills'),
    path('pay_success/', views.pay_success, name='pay_success'),
    path('pay_failed/', views.pay_failed, name='pay_failed'),
    path('pay_notify/', views.pay_notify, name='pay_notify'),
    path('product_program/<str:program_name>', views.product_program, name='product_program'),
    path('activate_test_period/', views.activate_test_period, name='activate_test_period'),
    path('download_program/<int:product_id>/', views.download_program, name='download_program'),
]
