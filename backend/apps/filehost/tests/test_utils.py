# filehost/tests/test_utils.py
import pytest
from django.test import RequestFactory

from apps.filehost.utils import parse_pagination


@pytest.mark.django_db
def test_parse_pagination_defaults():
    request = RequestFactory().get('/files/')
    page, page_size, offset = parse_pagination(request)
    assert page == 1
    assert page_size == 10
    assert offset == 0


@pytest.mark.django_db
def test_parse_pagination_custom():
    request = RequestFactory().get('/files/', {'page': '3', 'page_size': '5'})
    page, page_size, offset = parse_pagination(request)
    assert page == 3
    assert page_size == 5
    assert offset == 10
