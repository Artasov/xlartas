# social_oauth/routes/api.py
from django.urls import path

from apps.social_oauth.controllers.base import (
    oauth2_callback, get_user_social_accounts
)

app_name = 'social_oauth'

urlpatterns = [
    path('oauth/<str:provider_name>/callback/', oauth2_callback, name='oauth2_callback'),
    path('oauth/user/social-accounts/', get_user_social_accounts, name='get_user_social_accounts'),
]
