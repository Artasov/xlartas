# xlmine/controllers/auth.py
import logging
import uuid
from datetime import timedelta

from adrf.decorators import api_view
from adrf.requests import AsyncRequest
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models.user import User
from apps.xlmine.models.user import MinecraftSession, UserXLMine
from apps.xlmine.utils.session import build_profile, get_skin_url

log = logging.getLogger('yggdrasil')


@api_view(['GET'])
@permission_classes([AllowAny])
async def base(_request: AsyncRequest):
    return Response({}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
async def auth_server(_request):
    return Response({}, status=status.HTTP_200_OK)


# ------------------------------------------------------
# AUTH SERVER ENDPOINTS
# ------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
async def authenticate_view(request):
    """Yggdrasil: POST /authenticate"""
    data = request.data
    log.debug('authenticate payload %s', data)
    username_or_email = data.get('username')
    password = data.get('password')
    client_token = data.get('clientToken', str(uuid.uuid4()))

    user = await User.objects.aby_creds(username_or_email)
    if not user:
        return Response({'error': 'Нет пользователя с таким credential'}, status=status.HTTP_403_FORBIDDEN)

    if user.secret_key != password:
        return Response({'error': 'Неверный ключ'}, status=status.HTTP_403_FORBIDDEN)

    xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=user)
    skin_url = get_skin_url(xlmine_user, request)
    access_token = str(uuid.uuid4())

    session_obj = MinecraftSession(
        user=user,
        access_token=access_token,
        client_token=client_token,
        created_at=timezone.now()
    )
    await session_obj.asave()

    user_uuid = await user.service.xlmine_uuid()
    selected_profile = {
        'id': user_uuid.replace('-', ''),
        'name': user.username
    }
    resp = {
        'accessToken': access_token,
        'clientToken': client_token,
        'availableProfiles': [selected_profile],
        'selectedProfile': selected_profile,
        'user': await build_profile(user, skin_url),
    }
    return Response(resp, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
async def refresh_view(request):
    """Yggdrasil: POST /authserver/refresh"""
    data = request.data
    log.debug('refresh payload %s', data)
    old_access = data.get('accessToken')
    client_token = data.get('clientToken')

    try:
        session_obj = await MinecraftSession.objects.aget(
            access_token=old_access,
            client_token=client_token
        )
    except MinecraftSession.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    new_access = str(uuid.uuid4())
    session_obj.access_token = new_access
    session_obj.created_at = timezone.now()
    await session_obj.asave()

    user = session_obj.user
    user_uuid = await user.service.xlmine_uuid()
    selected_profile = {
        'id': user_uuid.replace('-', ''),
        'name': user.username
    }
    xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=user)
    skin_url = get_skin_url(xlmine_user, request)
    resp = {
        'accessToken': new_access,
        'clientToken': client_token,
        'selectedProfile': selected_profile,
        'user': await build_profile(user, skin_url),
    }
    return Response(resp, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
async def validate_view(request):
    """Yggdrasil: POST /authserver/validate"""
    data = request.data
    access_token = data.get('accessToken')
    client_token = data.get('clientToken')

    lifetime = settings.HOURS_MINECRAFT_SESSION_LIFETIME
    threshold = timezone.now() - timedelta(hours=lifetime)

    session: MinecraftSession = await MinecraftSession.objects.select_related('user').filter(
        access_token=access_token,
        client_token=client_token,
        created_at__gte=threshold
    ).afirst()

    if session:
        xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=session.user)
        skin_url = get_skin_url(xlmine_user, request)
        resp = {
            'accessToken': access_token,
            'clientToken': client_token,
            'selectedProfile': {
                'id': xlmine_user.uuid.replace('-', ''),
                'name': session.user.username
            },
            'user': await build_profile(session.user, skin_url)
        }
        return Response(resp)
    else:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([AllowAny])
async def invalidate_view(request):
    """Yggdrasil: POST /authserver/invalidate"""
    data = request.data
    log.debug('invalidate payload %s', data)
    access_token = data.get('accessToken')
    client_token = data.get('clientToken')

    try:
        session_obj = await MinecraftSession.objects.aget(
            access_token=access_token,
            client_token=client_token
        )
        await session_obj.adelete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except MinecraftSession.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([AllowAny])
async def signout_view(request):
    """Yggdrasil: POST /authserver/signout"""
    data = request.data
    log.debug('signout payload %s', data)
    username_or_email = data.get('username')
    password = data.get('password')

    user = await User.objects.aby_creds(username_or_email)
    if not user:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if not user.check_password(password):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    await MinecraftSession.objects.filter(user=user).adelete()

    return Response(status=status.HTTP_204_NO_CONTENT)
