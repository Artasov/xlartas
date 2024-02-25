
class ForceHttpsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.is_secure():
            request._current_scheme_host = request.build_absolute_uri().replace('http://', 'https://')
        response = self.get_response(request)
        return response