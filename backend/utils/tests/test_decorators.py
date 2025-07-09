import pytest
from django.test import RequestFactory
from django.http import HttpResponse
from django.contrib.auth.models import AnonymousUser

from apps.core.models import User
from utils.decorators import staff_required


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_staff_required_allows_staff():
    user = User.objects.create_user(username='staff', password='pass', is_staff=True)
    request = RequestFactory().get('/')
    request.user = user

    @staff_required
    async def view(req):
        return HttpResponse('ok')

    response = await view(request)
    assert response.status_code == 200
    assert response.content == b'ok'


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_staff_required_denies_non_staff():
    user = User.objects.create_user(username='user', password='pass', is_staff=False)
    request = RequestFactory().get('/')
    request.user = user

    @staff_required
    async def view(req):
        return HttpResponse('ok')

    response = await view(request)
    assert response.status_code == 403


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_staff_required_denies_anonymous():
    request = RequestFactory().get('/')
    request.user = AnonymousUser()

    @staff_required
    async def view(req):
        return HttpResponse('ok')

    response = await view(request)
    assert response.status_code == 403
