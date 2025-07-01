from django.urls import include, path

urlpatterns = [
    path('filehost/', include('apps.filehost.urls')),
]
