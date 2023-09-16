from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include
from django.urls import path
from django.views.generic import TemplateView

from . import views

app_name = 'harmony'

urlpatterns = [
    path('trainer/', views.trainer, name='trainer'),
    path('chords/', views.chords, name='chords'),
    path('get_scale_chords_combinations'
         '/<str:tonic>'
         '/<str:mode>'
         '/<str:quality>'
         '/<int:dim>'
         '/<int:progressions_len>'
         '/<int:max_repeats>'
         '/<str:out_sharp_or_flat>/',
         views.get_scale_chords_combinations,
         name='get_scale_chords_combinations'),
    path('get_chords_combinations_by_template'
         '/<str:template>'
         '/<str:mode>'
         '/<str:quality>'
         '/<int:dim>'
         '/<str:out_sharp_or_flat>/',
         views.get_chords_combinations_by_template,
         name='get_chords_combinations_by_template'),
]