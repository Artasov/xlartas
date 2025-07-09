# analytics/controllers/graphics.py
import json
import logging

from django.http import HttpResponseBadRequest
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)

from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Q
from django.shortcuts import render

from apps.analytics.models import Visit
from apps.analytics.utils import parse_chart_filters
from apps.commerce.models.order import Order


@staff_member_required
def visits_chart(request):
    group_by = request.GET.get('group_by', '')
    start_date_str = request.GET.get('start_date', '')
    end_date_str = request.GET.get('end_date', '')

    try:
        filters, period, trunc_func, label_format = parse_chart_filters(request)
    except ValueError as exc:  # pragma: no cover - simple branch
        if str(exc) == 'start_date':
            return HttpResponseBadRequest(_('Invalid start_date'))
        return HttpResponseBadRequest(_('Invalid end_date'))

    qs = Visit.objects.exclude(user_id=1).filter(**filters).annotate(period=trunc_func).values('period').annotate(
        unique_ips=Count('ip_address', distinct=True)
    ).order_by('period')

    labels = [entry['period'].strftime(label_format) for entry in qs]
    data = [entry['unique_ips'] for entry in qs]

    context = {
        'labels': json.dumps(labels),
        'data': json.dumps(data),
        'selected_period': period,
        'start_date': start_date_str,
        'end_date': end_date_str,
        'group_by': group_by,
    }
    return render(request, 'analytics/chart_visits.html', context)


@staff_member_required
def orders_chart(request):
    group_by = request.GET.get('group_by', '')
    start_date_str = request.GET.get('start_date', '')
    end_date_str = request.GET.get('end_date', '')

    try:
        filters, period, trunc_func, label_format = parse_chart_filters(request)
    except ValueError as exc:  # pragma: no cover - simple branch
        if str(exc) == 'start_date':
            return HttpResponseBadRequest(_('Invalid start_date'))
        return HttpResponseBadRequest(_('Invalid end_date'))

    qs = Order.objects.exclude(user_id=1).filter(**filters).annotate(period=trunc_func).values('period').annotate(
        total=Count('id'),
        executed=Count('id', filter=Q(is_executed=True)),
        cancelled=Count('id', filter=Q(is_cancelled=True))
    ).order_by('period')

    labels = [entry['period'].strftime(label_format) for entry in qs]
    total_data = [entry['total'] for entry in qs]
    executed_data = [entry['executed'] for entry in qs]
    cancelled_data = [entry['cancelled'] for entry in qs]

    context = {
        'labels': json.dumps(labels),
        'total_data': json.dumps(total_data),
        'executed_data': json.dumps(executed_data),
        'cancelled_data': json.dumps(cancelled_data),
        'selected_period': period,
        'start_date': start_date_str,
        'end_date': end_date_str,
        'group_by': group_by,
    }
    return render(request, 'analytics/chart_orders.html', context)
