from django.urls import path

from apps.analytics.controllers.graphics import visits_chart

app_name = 'analytics'

urlpatterns = [
    path('chart/', visits_chart, name='visits_chart'),
]
