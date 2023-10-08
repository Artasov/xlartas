import functools
import json
from datetime import datetime

from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from APP_shop.models import Product, Subscription
from Core.error_messages import LOGIN_OR_SECRET_KEY_WRONG, MULTI_ACCOUNT_PROHIBITED, PRODUCT_NOT_EXISTS, \
    LICENSE_TIMEOUT, SOMETHING_WRONG, HWID_NOT_EQUAL
from Core.models import User


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_program(request):
    data = json.loads(request.body)

    hw_id = data.get('hw_id')
    product = data.get('product')
    is_first_license_checking = data.get('is_first_license_checking')

    if not all([hw_id, product, str(is_first_license_checking)]):
        return Response({'accept': False, 'error': SOMETHING_WRONG},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    try:
        user_ = User.objects.get(username=data['username'], secret_key=data['secret_key'])
    except User.DoesNotExist:
        return Response({'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    if User.objects.filter(hw_id=hw_id).count() > 1:
        return Response({'accept': False, 'error': MULTI_ACCOUNT_PROHIBITED},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    is_first_start = False

    if not user_.hw_id:
        user_.hw_id = hw_id
        user_.save()
        is_first_start = True
    elif hw_id != user_.hw_id:
        return Response({'accept': False, 'error': HWID_NOT_EQUAL, 'error_type': 'hw_id'},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    try:
        product_ = Product.objects.get(name=product)
    except Product.DoesNotExist:
        return Response({'accept': False, 'error': PRODUCT_NOT_EXISTS},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    license_, created = Subscription.objects.get_or_create(user=user_, product=product_)
    # if license expired
    if license_.date_expiration <= timezone.now():
        if product == 'xLUMRA':
            # Give FREE version
            if is_first_license_checking:
                license_.save()
            return Response(
                {'accept': True, 'full_license': False, 'hw_id': user_.hw_id, 'is_first_start': is_first_start},
                headers={'Content-Type': 'application/json'}, status=status.HTTP_200_OK)
        # elif product == 'xLMACROS':
        #     pass
        else:
            return Response({'accept': False, 'error': LICENSE_TIMEOUT.format(
                f'<a style="color: white;" href="{request.build_absolute_uri(reverse("shop:catalog"))}">shop</a>'
            )}, status=status.HTTP_200_OK,
                            headers={'Content-Type': 'application/json'})

    if is_first_license_checking:
        license_.count_starts += 1
    license_.save()
    return Response({'accept': True, 'full_license': True, 'hw_id': user_.hw_id, 'is_first_start': is_first_start},
                    headers={'Content-Type': 'application/json'}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def set_hw_id(request):
    data = json.loads(request.body)
    username = data['username']
    secret_key = data['secret_key']
    hw_id = data['hw_id']

    if not all([username, secret_key, hw_id]):
        return Response({'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    try:
        user_ = User.objects.get(username=username, secret_key=secret_key)
    except User.DoesNotExist:
        return Response({'accept': False, 'error': LOGIN_OR_SECRET_KEY_WRONG},
                        status=status.HTTP_200_OK,
                        headers={'Content-Type': 'application/json'})

    user_.hw_id = hw_id
    user_.save()
    user_licenses = Subscription.objects.filter(user=user_)
    user_licenses.update(date_expiration=timezone.now())
    return Response({'accept': True}, headers={'Content-Type': 'application/json'})


@api_view(['GET'])
def get_product_version(request, product):
    try:
        product_ = Product.objects.get(name=product)
        url = request.build_absolute_uri(reverse('shop:download_program', kwargs={'product_id': product_.id}))
        return Response({
            'version': product_.version,
            'url': url
        },
            headers={'Content-Type': 'application/json'})
    except Product.DoesNotExist:
        return Response('Product does not exist.', status=status.HTTP_404_NOT_FOUND,
                        headers={'Content-Type': 'application/json'})
