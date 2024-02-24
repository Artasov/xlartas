import logging

from django.contrib.auth.decorators import login_required
from django.db import connections
from django.forms import modelform_factory
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django_minio_backend import MinioBackend
from django_redis import get_redis_connection

from apps.Core.forms import DonateFrom
from apps.Core.models import *
from apps.Core.services.services import base_view
from apps.referral.models import RefLinking
from apps.shop.models import Product, Subscription, Order
from apps.shop.services.qiwi import create_payment_and_order

log = logging.getLogger('base')


@base_view
def main(request):
    return render(request, 'Core/main.html', {
        'products': Product.objects.filter(available=True)
    })


@base_view
@login_required(redirect_field_name=None, login_url='signin')
def profile(request):
    user_ = User.objects.get(username=request.user.username)
    user_subs = Subscription.objects.filter(user=user_)
    least_days = {}
    context = {}
    for sub_ in user_subs:
        remained = int((sub_.date_expiration - timezone.now()).total_seconds() / 3600)
        if remained > 9600:
            remained = 'FOREVER'
        elif remained < 1:
            remained = 'None'
        least_days[Product.objects.get(id=sub_.product_id).name] = remained
    if RefLinking.objects.filter(referral__username=user_.username).exists():
        context['inviter_'] = RefLinking.objects.get(referral__username=user_.username).inviter

    context['least_days'] = least_days
    context['domain'] = request.build_absolute_uri('/')[0:-1]
    context['user_'] = user_
    form = modelform_factory(User, fields=('username',))(request.POST or None, instance=user_)
    if form.is_valid():
        form.save()
    context['form'] = form
    return render(request, 'Core/profile.html', context)


@base_view
@login_required
def donate(request):
    form = DonateFrom(request.POST or None)
    if form.is_valid():
        order_ = create_payment_and_order(
            user_id=request.user.id,
            amount=form.cleaned_data.get('amount'),
            order_type=Order.OrderType.DONATE,
            expired_minutes=10,
            comment=f'User deposit: {request.user.username}\n')
        return redirect(order_.pay_link)
    print(1)
    return render(request, 'Core/donate.html', {'form': form})


def health_test(request) -> HttpResponse:
    # Проверка Redis
    if not get_redis_connection().flushall():
        log.error('Redis have not yet come to life')
        return HttpResponse("Redis error", status=500)
    try:
        connections['default'].cursor()
    except Exception as e:
        log.error(f'DB have not yet come to life: {str(e)}')
        return HttpResponse(f"DB error: {str(e)}", status=500)

    minio_available = MinioBackend().is_minio_available()  # An empty string is fine this time
    if not minio_available:
        log.error(f'MINIO ERROR')
        log.error(minio_available.details)
        log.error(f'MINIO_STATIC_FILES_BUCKET = {MinioBackend().MINIO_STATIC_FILES_BUCKET}')
        log.error(f'MINIO_MEDIA_FILES_BUCKET = {MinioBackend().MINIO_MEDIA_FILES_BUCKET}')
        log.error(f'base_url = {MinioBackend().base_url}')
        log.error(f'base_url_external = {MinioBackend().base_url_external}')
        log.error(f'HTTP_CLIENT = {MinioBackend().HTTP_CLIENT}')
        return HttpResponse(f"MINIO ERROR", status=500)
    return HttpResponse("OK")
