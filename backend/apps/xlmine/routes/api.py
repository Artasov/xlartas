# xlmine/routes/api.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.xlmine.controllers.base import (
    ReleaseViewSet, LauncherViewSet,
    get_latest_launcher, get_latest_release,
    get_current_privilege, get_latest_donate_product, list_privileges, ChunkedReleaseUploadView
)
from apps.xlmine.controllers.eco import balance, pay

app_name = 'xlmine'

router = DefaultRouter()
router.register(r'launcher', LauncherViewSet, basename='launcher')
router.register(r'release', ReleaseViewSet, basename='release')

urlpatterns = [
    path('yggdrasil/', include('apps.xlmine.routes.yggdrasil')),

    path('chunked-release/', ChunkedReleaseUploadView.as_view()),
    path('launcher/latest/', get_latest_launcher),
    path('release/latest/', get_latest_release),
    path('donate/product/latest/', get_latest_donate_product),
    path('privilege/current/', get_current_privilege),
    path('privilege/', list_privileges),
    path('', include(router.urls)),

    path('balance/', balance, name='balance'),
    path('pay/', pay, name='pay'),
]
