# analytics/utils.py
import logging
from datetime import datetime
from typing import Any

from django.db.models.functions import TruncDay, TruncHour, TruncMonth

logger = logging.getLogger(__name__)


def parse_chart_filters(request) -> tuple[
    dict[str, datetime],
    str | Any,
    TruncMonth | TruncDay | TruncHour,
    str
]:
    """Parse common chart query parameters.

    Returns a tuple of:
        filters - dictionary for queryset filtering by created_at
        period - resolved period string
        group_by - aggregation function for created_at
        label_format - strftime format for labels
    """
    period = request.GET.get("period", "day")
    group_by_param = request.GET.get("group_by", "")
    start_date_str = request.GET.get("start_date", "")
    end_date_str = request.GET.get("end_date", "")

    filters: dict[str, datetime] = {}
    date_format = "%Y-%m-%d"

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, date_format)
        except ValueError as exc:  # pragma: no cover - simple parsing
            logger.warning("Invalid start_date %s: %s", start_date_str, exc)
            raise ValueError("start_date") from exc
        filters["created_at__gte"] = start_date

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, date_format)
        except ValueError as exc:  # pragma: no cover - simple parsing
            logger.warning("Invalid end_date %s: %s", end_date_str, exc)
            raise ValueError("end_date") from exc
        filters["created_at__lte"] = end_date

    if group_by_param == "hour":
        group_by = TruncHour("created_at")
        label_format = "%H:%M"
    elif group_by_param == "day":
        group_by = TruncDay("created_at")
        label_format = "%Y-%m-%d"
    elif group_by_param == "month":
        group_by = TruncMonth("created_at")
        label_format = "%Y-%m"
    else:
        if period == "day":
            group_by = TruncHour("created_at")
            label_format = "%H:%M"
        elif period in ["week", "month"]:
            group_by = TruncDay("created_at")
            label_format = "%Y-%m-%d"
        elif period == "year":
            group_by = TruncMonth("created_at")
            label_format = "%Y-%m"
        else:
            group_by = TruncDay("created_at")
            label_format = "%Y-%m-%d"
            period = "custom"

    return filters, period, group_by, label_format
