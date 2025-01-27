# shop/middleware.py
import ipaddress

from django.http import HttpResponseForbidden


class QiwiIPMiddleware:
    ALLOWED_IP_RANGES = [
        ipaddress.IPv4Network('79.142.16.0/20'),
        ipaddress.IPv4Network('195.189.100.0/22'),
        ipaddress.IPv4Network('91.232.230.0/23'),
        ipaddress.IPv4Network('91.213.51.0/24'),
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        client_ip = ipaddress.IPv4Address(request.META.get('REMOTE_ADDR'))

        if not any(client_ip in allowed_range for allowed_range in self.ALLOWED_IP_RANGES):
            return HttpResponseForbidden("Access forbidden. Your IP address is not allowed to access this resource.")

        response = self.get_response(request)
        return response
