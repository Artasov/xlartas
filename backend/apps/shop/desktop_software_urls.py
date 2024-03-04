from django.urls import path


urlpatterns = [  # /api/v1/
    path('login_program/', login_program, name='login_program'),
    path('set_hw_id/', set_hw_id, name='set_hw_id'),
    path('get_product_version/<str:software>/', get_product_version, name='get_product_version'),
]
