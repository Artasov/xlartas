import json
import os
from datetime import datetime
from datetime import timedelta

import jwt
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from APP_shop.models import Product, License
from Core.models import User
from xLLIB_v1 import random_str


@api_view(['GET'])
def randomStrAPIView(request):
    throttle_classes = [UserRateThrottle, AnonRateThrottle]
    params = dict(request.GET)

    try:
        try:
            count = int(params['count'][0])
            length = int(params['length'][0])
            alphabet = params['alphabet'][0]
            repete = True if params['repete'][0] == 'True' or params['repete'][0] == 'true' else False
            upper = True if params['upper'][0] == 'True' or params['upper'][0] == 'true' else False
            digits = True if params['digits'][0] == 'True' or params['digits'][0] == 'true' else False
        except ValueError:
            return Response({
                "response": 'ERROR. Check if the request belongs to a template: http://xxx.xx/random_str?length=int&alphabet=x&repete=bool&upper=bool&digits=bool. For more information, see the documentation on the xlartas website.'})

        if length > 400:
            return Response({
                "response": 'length value must be less than 400. For more information, see the documentation on the xlartas website.'})
        if count > 200:
            return Response({
                "response": 'count value must be less than 200. For more information, see the documentation on the xlartas website.'})
        if len(alphabet) > 200:
            return Response({
                "response": 'alphabet value length must be less than 200. For more information, see the documentation on the xlartas website.'})

        rand_strs_list = []

        for i in range(count):
            rand_strs_list.append(random_str(
                length=length,
                alphabet=alphabet,
                repete=repete,
                upper=upper,
                digits=digits
            ))
    except KeyError:
        return Response({
            "response": 'ERROR. Check if the request belongs to a template: http://xxx.xx/random_str?length=int&alphabet=x&repete=bool&upper=bool&digits=bool. For more information, see the documentation on the xlartas website.'})

    return Response({"response": rand_strs_list})



@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def programAuth(request):
    throttle_classes = [UserRateThrottle, AnonRateThrottle]
    if request.method != "POST":
        return Response({'accept': False, 'error': 'Invalid request'}, headers={'Content-Type': 'application/json'})

    json_data = list(dict(request.POST).keys())[0]
    data = dict(json.loads(json_data))
    user_ = authenticate(request, username=data['username'], password=data['password'])
    if user_ is None:
        if User.objects.filter(username=data['username'], custom_key=data['password']).exists():
            user_ = User.objects.get(username=data['username'], custom_key=data['password'])
        else:
            return Response({'accept': False, 'error': 'Login or password\n invalid'},
                            headers={'Content-Type': 'application/json'})
    if User.objects.filter(HWID=data['HWID']).count() > 1 and data['HWID'] != "":
        return Response({'accept': False, 'error': 'Multi-account\nis prohibited.'},
                        headers={'Content-Type': 'application/json'})

    is_first_start = False
    if user_.HWID is None:
        user_.HWID = data['HWID']
        user_.save()
        is_first_start = True
    else:
        if data['HWID'] != user_.HWID:
            return Response({'accept': False, 'error': 'HWID_ERR'},
                            headers={'Content-Type': 'application/json'})

    product_ = Product.objects.get(name=data['product'])
    license_ = License.objects.get_or_create(user=user_, product=product_)[0]
    if license_.date_expiration > datetime.now():
        license_.count_starts += 1
        license_.save()
        return Response({'accept': True, 'full_license': True, 'HWID': user_.HWID, 'FIRST': is_first_start},
                        headers={'Content-Type': 'application/json'})
    if product_.name == 'xLUMRA':
        # Если лицензия просрочена, то выдается бесплатная лицензия, для определенных продуктов
        license_.count_starts += 1
        license_.save()
        return Response({'accept': True, 'full_license': False, 'HWID': user_.HWID, 'FIRST': is_first_start},
                        headers={'Content-Type': 'application/json'})

    return Response({'accept': False, 'error': 'License timeout'},
                    headers={'Content-Type': 'application/json'})


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def setHWID(request):
    throttle_classes = [UserRateThrottle, AnonRateThrottle]
    if request.method != "POST":
        return Response({'accept': False, 'error': 'Invalid request'},
                        headers={'Content-Type': 'application/json'})

    json_date = list(dict(request.POST).keys())[0]
    data = dict(json.loads(json_date))
    user_: User = authenticate(request, username=data['username'], password=data['password'])
    if user_ is None:
        if not User.objects.filter(username=data['username'], custom_key=data['password']).exists():
            return Response({'accept': False, 'error': 'Login or password\n invalidы'},
                            headers={'Content-Type': 'application/json'})
        user_ = User.objects.get(username=data['username'], custom_key=data['password'])
    user_.HWID = data['HWID']
    user_.save()
    user_licenses = License.objects.filter(user=user_)
    for license_ in user_licenses:
        license_.date_expiration = datetime.utcnow()
        license_.save()
    return Response({'accept': True, }, headers={'Content-Type': 'application/json'})


@api_view(['GET'])
def productVersion(request, product):
    throttle_classes = [UserRateThrottle, AnonRateThrottle]
    if Product.objects.filter(name=product).exists():
        product = Product.objects.get(name=product)
        return Response({'version': product.version}, headers={'Content-Type': 'application/json'})
    else:
        return Response('Product does not exist.', headers={'Content-Type': 'application/json'})
