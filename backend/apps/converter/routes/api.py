from django.urls import path

from apps.converter.controllers.base import (
    list_formats,
    conversion_variants,
    format_parameters,
    create_conversion,
    conversion_status,
)

app_name = 'converter'

urlpatterns = [
    path('converter/formats/', list_formats),
    path('converter/formats/<int:format_id>/variants/', conversion_variants),
    path('converter/formats/<int:format_id>/parameters/', format_parameters),
    path('converter/convert/', create_conversion),
    path('converter/conversion/<int:conversion_id>/', conversion_status),
]
