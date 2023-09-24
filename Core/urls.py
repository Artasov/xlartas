from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include
from django.urls import path
from django.views.generic import TemplateView

from . import views
from .views.auth.auth_views import password_reset_confirmation, password_reset, signin, signup, signup_confirmation
from .views.auth.soc_auth_views import vk_auth, telegram_auth
from .views.common_views import profile, main, donate

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/v1/', include('APP_api.urls')),

    path('accounts/telegram/login/callback/', telegram_auth, name='telegram_signup'),
    path('accounts/vk/login/callback/', vk_auth),

    path('referral/', include(('APP_referral.urls', 'APP_referral'), namespace='referral')),
    path('freekassa/', include('freekassa.urls')),
    path('shop/', include(('APP_shop.urls', 'APP_shop'), namespace='shop')),
    path('private-msg/', include(('APP_private_msg.urls', 'APP_private_msg'), namespace='private-msg')),
    path('host/', include(('APP_filehost.urls', 'APP_filehost'), namespace='host')),
    path('rp/', include(('APP_resource_pack.urls', 'APP_resource_pack'), namespace='rp')),
    path('tests/', include(('APP_tests.urls', 'APP_tests'), namespace='tests')),
    path('harmony/', include('APP_Harmony.urls')),

    path('', main, name='main'),
    path('signup/', signup, name='signup'),
    path('signup_confirmation/<str:code>/', signup_confirmation, name='signup_confirmation'),
    path('signin/', signin, name='signin'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password_reset/', password_reset, name='password_reset'),
    path('password_reset_confirmation/<str:code>/', password_reset_confirmation,
         name='password_reset_confirmation'),
    path('profile/', profile, name='profile'),

    path('donate/', donate, name='donate'),
    path('about/', TemplateView.as_view(template_name='Core/about.html'), name='about'),
    path('terms_and_conditions/', TemplateView.as_view(template_name='Core/terms_and_conditions.html'),
         name='terms_and_conditions'),
    path('privacy_policy/', TemplateView.as_view(template_name='Core/privacy_policy.html'), name='privacy_policy'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEV:
    urlpatterns.append(path('__debug__/', include('debug_toolbar.urls')))
