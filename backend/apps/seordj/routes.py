# seordj/routes.py
from django.urls import re_path

from apps.seordj.controllers.all import (
    index
)

urlpatterns = [
    re_path(r'^.*$', index),
]
