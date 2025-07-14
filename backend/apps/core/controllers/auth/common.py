# core/controllers/auth/common.py
from random import randint

from adjango.adecorators import acontroller
from adjango.aserializers import SerializerErrors
from adjango.utils.base import phone_format
from adrf.decorators import api_view
from django.contrib.auth import alogout
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.captcha.yandex import captcha_required
from apps.confirmation.models.base import ConfirmationCode
from apps.core.confirmations.actions import CoreConfirmationActionType
from apps.core.exceptions.base import CoreException
from apps.core.exceptions.user import UserException
from apps.core.models.user import User
from apps.core.serializers.user.base import SignUpSerializer
from utils.log import get_global_logger

log = get_global_logger()


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
        email = data.get('email')
        phone = data.get('phone')
        timezone = data.get('timezone')
        if email is None:
            raise UserException.WrongCredential()

        if phone: phone = phone_format(phone)

        if email is not None and await User.objects.aby_creds(email):
            raise UserException.AlreadyExistsWithThisEmail()
        if phone is not None and await User.objects.aby_creds(phone):
            raise UserException.AlreadyExistsWithThisPhone()

        if email:
            username = f'{email.split('@')[0]}{randint(1000, 9999)}'
        else:
            username = f'{phone}_{randint(1000, 9999)}'
        if email:
            await User.objects.acreate_user(
                username=username,
                first_name=first_name,
                email=email,
                phone=phone,
                timezone=timezone
            )
        else:
            await User.objects.acreate_user(
                username=username,
                first_name=first_name,
                phone=phone,
                timezone=timezone
            )
        await ConfirmationCode.create_and_send(
            request=request,
            action=CoreConfirmationActionType.SIGNUP,
            method='email',  # Потому что у нас только по email подтверждения создания аккаунта
            credential=email,
            raise_exceptions=True
        )
        return Response({
            'message': _('Your account has been created, please confirm your phone number'),
            'confirmation_sent': True,
            'credential': email,
            'confirmation_method': 'email'
        }, status=201)
    raise SerializerErrors(serializer.errors)
