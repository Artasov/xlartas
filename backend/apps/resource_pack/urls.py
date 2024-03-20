from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('search/', views.search, name='search'),
    path('add_new/', views.add_new, name='add_new'),
    path('vote/', views.vote, name='vote'),
    path('<slug:slug>/', views.detail, name='detail'),
    path('download/<int:pk>/', views.download, name='download'),
    path('get_new_for_pagination/<int:last_rp_num>/', views.get_new_for_pagination, name='get_new_for_pagination'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
