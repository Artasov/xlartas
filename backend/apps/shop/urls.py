from django.urls import path

from .views.software_api import (
    software_list,
    download_software_file,
    software_by_name,
    software_subscribe_current_user,
    software_test_activate_current_user as test_activate_cur_user
)
from .views.subscription_api import current_user_subscriptions

app_name = 'shop'

urlpatterns = [
    path('subs/current_user/',
         current_user_subscriptions,
         name='current_user_subscriptions'),

    path('software/', software_list, name='software_list'),
    path('software/test-activate/', test_activate_cur_user, name='software_test_activate_current_user'),
    path('software/subscribe/', software_subscribe_current_user, name='software_subscribe_current_user'),
    path('software/<str:name>/', software_by_name, name='software_by_name'),
    path('software/download/<int:id>/',
         download_software_file, name='software_download'),

    # path('orders/', views.orders, name='orders'),
    # path('check_payment/', views.check_payment, name='check_payment'),
    # path('activate_test_period/', views.activate_test_period, name='activate_test_period'),
]
