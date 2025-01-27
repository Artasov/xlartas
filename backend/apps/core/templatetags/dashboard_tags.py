# core/templatetags/dashboard_tags.py

from django import template
from django.utils.timezone import now

from apps.commerce.models import Order

register = template.Library()


@register.simple_tag
def orders_today(status):
    today = now().date()
    if status == 'PAID':
        return Order.objects.filter(is_paid=True, created_at__date=today).count()
    elif status == 'UNPAID':
        return Order.objects.filter(is_paid=False, created_at__date=today).count()
    else:
        return 'Неизвестный статус'


@register.simple_tag
def orders_this_month(status):
    today = now()
    start_of_month = today.replace(day=1)
    if status == 'PAID':
        return Order.objects.filter(is_paid=True, created_at__gte=start_of_month, created_at__lte=today).count()
    elif status == 'UNPAID':
        return Order.objects.filter(is_paid=False, created_at__gte=start_of_month, created_at__lte=today).count()
    else:
        return 'Неизвестный статус'
