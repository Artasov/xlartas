import logging

from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.contrib.auth import alogout
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.core.exceptions.base import CoreExceptions
from apps.core.exceptions.user import UserExceptions
from apps.core.messages.success import USER_CREATED_CONFIRM_EMAIL
from apps.core.models.user import User
from apps.core.serializers.user.base import SignUpSerializer
from adjango.adecorators import acontroller
from apps.captcha.yandex import captcha_required

log = logging.getLogger('global')


@acontroller('Logout')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def logout(request) -> Response:
    try:
        await alogout(request)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_200_OK)


@acontroller('Sign Up')
@api_view(('POST',))
@permission_classes((AllowAny,))
@captcha_required
async def signup(request) -> Response:
    if not request.is_captcha_valid: raise CoreExceptions.CaptchaInvalid()
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        data = await serializer.adata
        username = data['username']
        email = data['email']
        password = data['password']

        if await User.objects.filter(username=username).aexists():
            raise UserExceptions.UsernameAlreadyExists()

        if await User.objects.filter(email=email).aexists():
            raise UserExceptions.UserEmailAlreadyExists()

        await sync_to_async(User.objects.create_user, thread_sensitive=True)(
            username=username, email=email, password=password, is_confirmed=False
        )
        return Response({'message': USER_CREATED_CONFIRM_EMAIL}, status=201)
    raise CoreExceptions.SerializerErrors(
        serializer_errors=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )
