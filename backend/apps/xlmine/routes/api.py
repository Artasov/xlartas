# xlmine/routes/api.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.xlmine.controllers.base import get_latest_launcher, get_latest_release, ReleaseViewSet, LauncherViewSet

app_name = 'xlmine'

router = DefaultRouter()
router.register(r'launcher', LauncherViewSet, basename='launcher')
router.register(r'release', ReleaseViewSet, basename='release')

urlpatterns = [
    path('launcher/latest/', get_latest_launcher),
    path('release/latest/', get_latest_release),
    path('', include(router.urls)),
]
