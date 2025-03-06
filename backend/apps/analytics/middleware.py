from datetime import datetime, timedelta

from django.core.handlers.wsgi import WSGIRequest

from .models import Visit


class VisitLoggingMiddleware:
    """
    Middleware для логирования посещений.
    Запись создаётся только если:
      1. В URL присутствует строка 'current_user'
      2. Для данного IP за текущий час ещё не было записи.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self.log_visit(request)
        return response

    def log_visit(self, request: WSGIRequest):
        # Фиксируем только запросы, URL которых содержит 'current_user'
        full_path = request.get_full_path()
        if (len(request.path) > 1 and
                'current_user' not in full_path and
                'software' not in full_path):
            return

        ip = self.get_client_ip(request)
        if not ip or ip in ('localhost', '127.0.0.1'): return

        now = datetime.now()
        current_hour = now.replace(minute=0, second=0, microsecond=0)
        next_hour = current_hour + timedelta(hours=1)

        # Если уже существует запись с этим IP в текущем часу, выходим
        if Visit.objects.filter(
                ip_address=ip,
                created_at__gte=current_hour,
                created_at__lt=next_hour
        ).exists(): return

        Visit.objects.create(
            ip_address=ip,
            user=request.user if request.user.is_authenticated else None
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
