# core/middleware/other.py
import json
import logging

from django.conf import settings

logger = logging.getLogger('global')


class MediaDomainSubstitutionJSONMiddleware:
    """
    Middleware для подмены домена в JSON-ответах.
    Если какое-либо строковое значение начинается с settings.MEDIA_URL,
    оно заменяется на settings.MEDIA_DOMAIN + оригинальный путь.

    Например, если:
        MEDIA_URL = '/media/'
        MEDIA_DOMAIN = 'https://media.example.com'
    То строка "/media/user/images/avatar/AVA_BLACKRED.jpg"
    будет заменена на "https://media.example.com/media/user/images/avatar/AVA_BLACKRED_1TBnlKD.jpg"
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.media_url = getattr(settings, 'MEDIA_URL', '')
        self.media_domain = getattr(settings, 'MEDIA_DOMAIN', '')

    def __call__(self, request):
        response = self.get_response(request)
        content_type = response.get('Content-Type', '')
        if not self.media_domain:
            raise ValueError('settings.MEDIA_DOMAIN = "https://XXX.com" not specified')
        if 'application/json' in content_type and response.content:
            try:
                charset = response.charset if hasattr(response, 'charset') else 'utf-8'
                original_content = response.content.decode(charset)
                data = json.loads(original_content)
                new_data = self._replace_media_urls(data)
                new_content = json.dumps(new_data)
                response.content = new_content.encode(charset)
                response['Content-Length'] = len(response.content)
            except Exception as e:
                logger.exception('Error in MediaDomainSubstitutionJSONMiddleware: %s', e)
        return response

    def _replace_media_urls(self, data):
        if isinstance(data, dict):
            return {k: self._replace_media_urls(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._replace_media_urls(item) for item in data]
        elif isinstance(data, str):
            if self.media_domain and self.media_url and data.startswith(self.media_url):
                return f'{self.media_domain}{data}'
            return data
        return data
