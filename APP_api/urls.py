from django.urls import path

from . import views

urlpatterns = [  # /api/v1/
    path('random_str/', views.randomStrAPIView, name='api-random_str'),
    path('program_auth/', views.programAuth, name='program_auth'),
    path('set_hwid/', views.setHWID, name='set_hwid'),
    path('product_version/<str:product>/', views.productVersion, name='product_version'),
]
