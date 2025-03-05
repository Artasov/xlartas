import json

from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from django.shortcuts import render

from apps.analytics.models import Visit


@staff_member_required
def visits_chart(request):
    period = request.GET.get('period', 'day')
    if period == 'week':
        trunc_func = TruncWeek('created_at')
    elif period == 'month':
        trunc_func = TruncMonth('created_at')
    else:
        period = 'day'
        trunc_func = TruncDay('created_at')

    qs = Visit.objects.annotate(period=trunc_func).values('period').annotate(count=Count('id')).order_by('period')
    labels = [entry['period'].strftime('%Y-%m-%d') for entry in qs]
    data = [entry['count'] for entry in qs]

    context = {
        'labels': json.dumps(labels),
        'data': json.dumps(data),
        'selected_period': period,
    }
    return render(request, 'analytics/chart.html', context)
