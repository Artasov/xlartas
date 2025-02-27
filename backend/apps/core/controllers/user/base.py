# core/controllers/user/base.py
from adjango.adecorators import acontroller
from adjango.utils.base import is_email, is_phone
from adrf.decorators import api_view
from django.utils.translation import gettext_lazy as _
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK

from apps.commerce.models import Client
from apps.commerce.serializers.client import ClientPublicSerializer, ClientUpdateSerializer
from apps.core.exceptions.user import UserException
from apps.core.models import User
from apps.core.serializers.user.base import (
    UserSelfSerializer, UserUsernameSerializer,
    UserUpdateSerializer, UserAvatarSerializer
)


@acontroller('Get current user json info')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def current_user(request) -> Response:
    user: User = request.user
    user_data = await UserSelfSerializer(user).adata
    client, _ = await Client.objects.aget_or_create(user=user)
    client_data = await ClientPublicSerializer(client).adata
    return Response({
        **user_data,
        'client': client_data,
    }, status=200)


@acontroller('Rename current user')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def rename_current_user(request) -> Response:
    serializer = UserUsernameSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    data = await serializer.adata
    username = data.get('username')
    if username == request.user.username: raise UserException.AlreadyThisUsername()
    if await User.objects.filter(username=username).aexists():
        raise UserException.UsernameAlreadyExists()
    request.user.username = username
    await request.user.asave()
    return Response({'message': _('Great! You have successfully changed your username')}, status=HTTP_200_OK)


@acontroller('Update current user avatar')
@api_view(('PATCH',))
@permission_classes((IsAuthenticated,))
async def update_avatar(request):
    serializer = UserAvatarSerializer(request.user, data=request.data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    await serializer.asave()
    return Response(await serializer.adata, status=HTTP_200_OK)


@acontroller('Update current user')
@api_view(('PATCH',))
@permission_classes((IsAuthenticated,))
async def update_user(request):
    serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    await serializer.asave()
    return Response(await serializer.adata, status=HTTP_200_OK)


@acontroller('Update current client')
@api_view(('PATCH',))
@permission_classes((IsAuthenticated,))
async def update_client(request):
    user = request.user
    client = await Client.objects.agetorn(user=user)
    if not client: raise UserException.IsNotClient()
    serializer = ClientUpdateSerializer(client, data=request.data, partial=True)
    if await serializer.ais_valid():
        await serializer.asave()
        return Response(serializer.data, status=HTTP_200_OK)
    return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


@acontroller('Check User by Credential')
@api_view(('POST',))
@permission_classes((AllowAny,))
async def user_auth_methods(request):
    # Тут мы проверяем что ввел пользователь и есть ли он в базе
    # Если есть, то отправляем данные о пароле о подтвержденных
    # данных что бы дать выбор через что входить
    credential = request.data.get('credential')
    if not any((is_email(credential), is_phone(credential))):
        raise UserException.WrongCredential()
    user = await User.objects.by_creds(credential)
    if user:
        phone = str(user.phone)
        data = {
            'password_exists': bool(user.password) and user.has_usable_password(),
            'email': f'{user.email[:4]}***{user.email[-4:]}' if user.email else None,
            'phone': f'+{phone[:4]}***{phone[-4:]}' if phone else None,
            'is_email_confirmed': user.is_email_confirmed,
            'is_phone_confirmed': user.is_phone_confirmed,
        }
    else:
        data = {'user_not_exists': True}
    return Response(data, status=200)


@acontroller('Check if email exists')
@api_view(('POST',))
@permission_classes((AllowAny,))
async def check_email_exists(request):
    email = request.data.get('email')
    if not is_email(email):
        raise UserException.WrongCredential()
    exists = await User.objects.filter(email=email).aexists()
    return Response({'exists': exists}, status=200)


@acontroller('Check if phone exists')
@api_view(('POST',))
@permission_classes((AllowAny,))
async def check_phone_exists(request):
    phone = request.data.get('phone')
    if not is_phone(phone): raise UserException.WrongCredential()
    exists = await User.objects.filter(phone=phone).aexists()
    return Response({'exists': exists}, status=200)
