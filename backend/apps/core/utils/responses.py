from django.http import JsonResponse
from rest_framework.status import HTTP_403_FORBIDDEN


def json_access_denied(status: int = HTTP_403_FORBIDDEN) -> JsonResponse:
    """Return standardized JSON response for access denied."""
    return JsonResponse({'error': 'Access denied'}, status=status)
