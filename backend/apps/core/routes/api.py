# core/routes/api.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from apps.core.controllers.auth.common import signup, logout
from apps.core.controllers.user.base import (
    update_user, current_user, rename_current_user,
    update_client, update_avatar, user_auth_methods,
    check_phone_exists, check_email_exists
)
from apps.core.obtain_tokens import custom_token_obtain_pair_view

app_name = 'core'

urlpatterns = [
    path('token/', custom_token_obtain_pair_view),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('token/verify/', TokenVerifyView.as_view()),

    path('signup/', signup),
    path('current_user/', current_user),
    path('logout/', logout),

    path('user/rename/', rename_current_user),
    path('user/update/', update_user),
    path('user/update/avatar/', update_avatar),
    path('user/auth_methods/', user_auth_methods),
    path('check-phone-exists/', check_phone_exists),
    path('check-email-exists/', check_email_exists),
    path('client/update/', update_client),
]
