from django.urls import path

from . import views

urlpatterns = [
    path('list/', views.referrals_list, name='list'),
    path('info/', views.referral_program_info, name='info'),
    path('invited_by/<str:referral_code>/', views.set_my_inviter, name='set_my_inviter'),
]
