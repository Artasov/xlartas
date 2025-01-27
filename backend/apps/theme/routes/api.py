# theme/routes/api.py
from django.urls import path

from apps.theme.controllers.base import theme_list

app_name = 'theme'

urlpatterns = [
    path('themes/', theme_list, name='theme_list'),
]
