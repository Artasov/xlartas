# analytics/controllers/graphics.py
import json
from datetime import datetime

from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Q
from django.db.models.functions import TruncHour, TruncDay, TruncMonth
from django.shortcuts import render

from apps.analytics.models import Visit
from apps.commerce.models.order import Order


@staff_member_required
def visits_chart(request):
    period = request.GET.get('period', 'day')
    group_by = request.GET.get('group_by', '')
    start_date_str = request.GET.get('start_date', '')
    end_date_str = request.GET.get('end_date', '')

    filters = {}
    date_format = "%Y-%m-%d"
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, date_format)
            filters['created_at__gte'] = start_date
        except Exception:
            pass
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, date_format)
            filters['created_at__lte'] = end_date
        except Exception:
            pass

    # Определяем функцию группировки и формат метки
    if group_by == 'hour':
        trunc_func = TruncHour('created_at')
        label_format = '%H:%M'
    elif group_by == 'day':
        trunc_func = TruncDay('created_at')
        label_format = '%Y-%m-%d'
    elif group_by == 'month':
        trunc_func = TruncMonth('created_at')
        label_format = '%Y-%m'
    else:
        # Если явно не указано, выбираем по режиму period
        if period == 'day':
            trunc_func = TruncHour('created_at')
            label_format = '%H:%M'
        elif period in ['week', 'month']:
            trunc_func = TruncDay('created_at')
            label_format = '%Y-%m-%d'
        elif period == 'year':
            trunc_func = TruncMonth('created_at')
            label_format = '%Y-%m'
        else:
            trunc_func = TruncDay('created_at')
            label_format = '%Y-%m-%d'
            period = 'custom'

    qs = Visit.objects.filter(**filters).annotate(period=trunc_func).values('period').annotate(
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
    period = request.GET.get('period', 'week')
    group_by = request.GET.get('group_by', '')
    start_date_str = request.GET.get('start_date', '')
    end_date_str = request.GET.get('end_date', '')

    filters = {}
    date_format = "%Y-%m-%d"
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, date_format)
            filters['created_at__gte'] = start_date
        except Exception:
            pass
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, date_format)
            filters['created_at__lte'] = end_date
        except Exception:
            pass

    # Определяем функцию группировки и формат метки для заказов
    if group_by == 'hour':
        trunc_func = TruncHour('created_at')
        label_format = '%H:%M'
    elif group_by == 'day':
        trunc_func = TruncDay('created_at')
        label_format = '%Y-%m-%d'
    elif group_by == 'month':
        trunc_func = TruncMonth('created_at')
        label_format = '%Y-%m'
    else:
        if period == 'day':
            trunc_func = TruncHour('created_at')
            label_format = '%H:%M'
        elif period in ['week', 'month']:
            trunc_func = TruncDay('created_at')
            label_format = '%Y-%m-%d'
        elif period == 'year':
            trunc_func = TruncMonth('created_at')
            label_format = '%Y-%m'
        else:
            trunc_func = TruncDay('created_at')
            label_format = '%Y-%m-%d'
            period = 'custom'

    qs = Order.objects.filter(**filters).annotate(period=trunc_func).values('period').annotate(
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
