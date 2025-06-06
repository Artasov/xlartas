import pytest
from django.test import RequestFactory

from apps.analytics.middleware import VisitLoggingMiddleware


@pytest.mark.django_db
def test_get_client_ip_forwarded():
    request = RequestFactory().get('/some-path', HTTP_X_FORWARDED_FOR='1.2.3.4')
    middleware = VisitLoggingMiddleware(lambda r: r)
    assert middleware.get_client_ip(request) == '1.2.3.4'


@pytest.mark.django_db
def test_get_client_ip_remote_addr():
    request = RequestFactory().get('/some-path', REMOTE_ADDR='5.6.7.8')
    middleware = VisitLoggingMiddleware(lambda r: r)
    assert middleware.get_client_ip(request) == '5.6.7.8'

