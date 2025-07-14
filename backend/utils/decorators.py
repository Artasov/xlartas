import asyncio
from functools import wraps

from django.http import JsonResponse
from rest_framework.status import HTTP_403_FORBIDDEN


def staff_required(view_func):
    """Ensure that request.user is authenticated and is staff."""
    if asyncio.iscoroutinefunction(view_func):
        @wraps(view_func)
        async def _wrapped(request, *args, **kwargs):
            user = getattr(request, "user", None)
            if not (user and user.is_authenticated and user.is_staff):
                return JsonResponse({'error': 'Access denied'}, status=HTTP_403_FORBIDDEN)
            return await view_func(request, *args, **kwargs)

        return _wrapped
    else:
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            user = getattr(request, "user", None)
            if not (user and user.is_authenticated and user.is_staff):
                return JsonResponse({'error': 'Access denied'}, status=HTTP_403_FORBIDDEN)
            return view_func(request, *args, **kwargs)

        return _wrapped
