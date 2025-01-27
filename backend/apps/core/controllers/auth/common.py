# core/controllers/auth/common.py
import logging
from random import randint

from adjango.adecorators import acontroller
from adjango.aserializers import SerializerErrors
from adjango.utils.base import phone_format
from adrf.decorators import api_view
from django.contrib.auth import alogout
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from django.utils.translation import gettext_lazy as _
from apps.captcha.yandex import captcha_required
from apps.confirmation.models.base import ConfirmationCode
from apps.core.confirmations.actions import CoreConfirmationActionType
from apps.core.exceptions.base import CoreException
from apps.core.exceptions.user import UserException
from apps.core.models.user import User
from apps.core.serializers.user.base import SignUpSerializer

log = logging.getLogger('global')


@acontroller('Logout')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def logout(request) -> Response:
    await alogout(request)
    return Response(status=status.HTTP_200_OK)


@acontroller('Sign Up')
@api_view(('POST',))
@permission_classes((AllowAny,))
@captcha_required
async def signup(request) -> Response:
    if not request.is_captcha_valid: raise CoreException.CaptchaInvalid()
    serializer = SignUpSerializer(data=request.data)
    if await serializer.ais_valid():
        data = await serializer.adata
        first_name = data.get('first_name', '')
        email = data.get('email', None)
        phone = data.get('phone', None)
        timezone = data.get('timezone')
        if not phone:
            raise UserException.WrongCredential()
        phone = phone_format(phone)

        if email is not None and await User.objects.filter(
                email=email
        ).aexists(): raise UserException.AlreadyExistsWithThisEmail()
        if email is not None and await User.objects.filter(
                phone=phone
        ).aexists(): raise UserException.AlreadyExistsWithThisPhone()

        if email:
            username = f'{email.split("@")[0]}{randint(1000, 9999)}'
        else:
            username = f'{phone}_{randint(1000, 9999)}'
        if email:
            user = await User.objects.acreate_user(
                username=username,
                first_name=first_name,
                email=email,
                phone=phone,
                timezone=timezone
            )
        else:
            user = await User.objects.acreate_user(
                username=username,
                first_name=first_name,
                phone=phone,
                timezone=timezone
            )
        await ConfirmationCode.create_and_send(
            request=request,
            action=CoreConfirmationActionType.SIGNUP,
            method='phone',  # Потому что у нас только по телефону подтверждения создания аккаунта
            credential=phone,
            raise_exceptions=True
        )
        return Response({
            'message': _('Your account has been created, please confirm your phone number'),
            'confirmation_sent': True,
            'credential': phone,
            'confirmation_method': 'phone'
        }, status=201)
    raise SerializerErrors(serializer.errors)
