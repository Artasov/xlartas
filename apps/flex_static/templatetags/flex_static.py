from django import template
from django.conf import settings

from django.templatetags.static import static as original_static

register = template.Library()


@register.simple_tag(name="static")
def flex_static(path):
    url = original_static(path)
    if settings.HTTPS and 'https' not in url:
        url = url.replace('http://', 'https://')
    return url
