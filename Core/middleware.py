import json
import urllib.parse
import urllib.request

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class reCaptchaMiddleware(MiddlewareMixin):
    def __call__(self, request):
        self.process_request(request)
        ####################################
        response = self.get_response(request)
        ####################################
        return response

    @staticmethod
    def process_request(request):
        if 'invalid' in request.session:
            del request.session['invalid']
        if request.method != 'GET':
            recaptcha_response = request.POST.get('g-recaptcha-response')
            url = 'https://www.google.com/recaptcha/api/siteverify'
            values = {
                'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                'response': recaptcha_response
            }
            data = urllib.parse.urlencode(values).encode()
            req = urllib.request.Request(url, data=data)
            response = urllib.request.urlopen(req)
            result = json.loads(response.read().decode())
            request.recaptcha_is_valid = result.get('success', False)
