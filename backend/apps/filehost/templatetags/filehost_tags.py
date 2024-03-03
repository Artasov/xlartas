from django import template
from django.conf import settings

register = template.Library()


@register.simple_tag()
def diffFloat(a, b, digits_after_dot=5):
    return float(str(a/b)[0:digits_after_dot])


@register.simple_tag()
def diffInt(a, b):
    return int(float(str(a/b)))


@register.simple_tag()
def max_upload_size_anon():
    return settings.MAX_UPLOAD_SIZE_ANON_MB


@register.simple_tag()
def max_upload_size_authed():
    return settings.MAX_UPLOAD_SIZE_AUTHED_MB