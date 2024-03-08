import logging

from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.contrib.auth.decorators import login_required
from django.db import connections
from django.forms import modelform_factory
from django.http import HttpResponse
from django.shortcuts import render
from django_minio_backend import MinioBackend
from django_redis import get_redis_connection
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.Core.models import *
from apps.Core.serializers import ThemeSerializer, CurrentUserSerializer
from apps.referral.models import RefLinking
from apps.shop.models import SoftwareProduct, UserSoftwareSubscription

log = logging.getLogger('base')


def main(request):
    return render(request, 'Core/main.html', {
        'products': SoftwareProduct.objects.filter(available=True)
    })


@login_required(redirect_field_name=None, login_url='signin')
def profile(request):
    user_ = User.objects.get(username=request.user.username)
    user_subs = UserSoftwareSubscription.objects.filter(user=user_)
    least_days = {}
    context = {}
    for sub_ in user_subs:
        remained = int((sub_.expires_at - timezone.now()).total_seconds() / 3600)
        if remained > 9600:
            remained = 'FOREVER'
        elif remained < 1:
            remained = 'None'
        least_days[SoftwareProduct.objects.get(id=sub_.product_id).name] = remained
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


# @login_required
# def donate(request):
#     form = DonateFrom(request.POST or None)
#     if form.is_valid():
#         order_ = create_payment_and_order(
#             user_id=request.user.id,
#             amount=form.cleaned_data.get('amount'),
#             order_type=SoftwareSubscriptionOrder.SoftwareOrderType.DONATE,
#             expired_minutes=10,
#             comment=f'User deposit: {request.user.username}\n')
#         return redirect(order_.pay_link)
#     return render(request, 'Core/donate.html', {'form': form})


@api_view(['GET'])
@permission_classes([AllowAny])
async def theme_list(request) -> Response:
    themes = await sync_to_async(list)(Theme.objects.all())
    serializer = ThemeSerializer(themes, many=True)
    return Response(await serializer.adata)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
async def current_user(request) -> Response:
    serializer = CurrentUserSerializer(request.user)
    return Response(await serializer.adata)


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
