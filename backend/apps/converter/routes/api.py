# converter/routes/api.py
from django.urls import path

from apps.converter.controllers.base import (
    formats,
    possible_out_formats,
    parameters,
    convert,
    conversion_status,
    download,
    remaining,
)

app_name = 'converter'

urlpatterns = [
    path('converter/formats/', formats),
    path('converter/formats/<int:format_id>/variants/', possible_out_formats),
    path('converter/formats/<int:format_id>/parameters/', parameters),
    path('converter/convert/', convert),
    path('converter/conversion/<int:conversion_id>/', conversion_status),
    path('converter/download/<int:conversion_id>/', download),
    path('converter/remaining/', remaining),
]
