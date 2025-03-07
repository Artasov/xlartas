from django.urls import path
from apps.analytics.controllers.graphics import visits_chart, orders_chart

app_name = 'analytics'

urlpatterns = [
    path('visits/', visits_chart, name='visits_chart'),
    path('orders/', orders_chart, name='orders_chart'),
]
