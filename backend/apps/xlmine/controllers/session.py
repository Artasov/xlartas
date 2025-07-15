# xlmine/controllers/session.py
import logging
import uuid

from adrf.decorators import api_view
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models.user import User
from apps.xlmine.models.user import MinecraftSession, UserXLMine

log = logging.getLogger('yggdrasil')


# ------------------------------------------------------
# SESSION SERVER ENDPOINTS
# ------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
async def join_server_view(request):
    """Yggdrasil: POST /session/minecraft/join"""
    data = request.data
    log.debug('join payload %s', data)
    access_token = data.get('accessToken')
    profile_id = data.get('selectedProfile')
    server_id = data.get('serverId')

    try:
        session_obj = await MinecraftSession.objects.select_related('user').aget(
            access_token=access_token
        )
    except MinecraftSession.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    user = session_obj.user
    _xlmine_user = UserXLMine.objects.aget_or_create(
        user=user,
        uuid=profile_id,
        uuid__gte=50,
    )
    session_obj.last_server_id = server_id
    await session_obj.asave()
    return Response({
        'accessToken': access_token,
        'clientToken': session_obj.client_token,
        'selectedProfile': profile_id,
        'user': {
            'id': profile_id,
            'username': user.username,
            'properties': [
                {
                    'name': 'preferredLanguage',
                    'value': 'ru'
                }
            ]
        }
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
async def has_joined_view(request):
    """Yggdrasil: GET /session/minecraft/hasJoined"""
    username = request.GET.get('username')
    server_id = request.GET.get('serverId')

    user = await User.objects.aby_creds(username)
    if not user:
        return Response(status=status.HTTP_204_NO_CONTENT)

    try:
        _session_obj = await MinecraftSession.objects.aget(
            user=user,
            last_server_id=server_id
        )
    except MinecraftSession.DoesNotExist:
        return Response(status=status.HTTP_204_NO_CONTENT)

    user_uuid = await user.service.xlmine_uuid()
    resp = {
        'id': user_uuid.replace('-', ''),
        'name': user.username,
        'properties': []
    }
    return Response(resp, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
async def profile_view(request, player_uuid):
    """Optional endpoint: GET /session/minecraft/profile/<UUID>"""
    log.debug('profile request_dict %s', request.__dict__)
    log.debug('profile request_data %s', request.data)
    log.debug('profile query %s', request.GET)
    full_uuid = str(player_uuid)
    log.debug('profile_view - player_uuid: %s', full_uuid)

    try:
        xlmine_user = await UserXLMine.objects.select_related('user').aget(uuid=full_uuid)
    except UserXLMine.DoesNotExist:
        if len(full_uuid) == 32:
            try:
                hyphen_uuid = str(uuid.UUID(full_uuid))
                xlmine_user = await UserXLMine.objects.select_related('user').aget(uuid=hyphen_uuid)
            except (ValueError, UserXLMine.DoesNotExist):
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    user = xlmine_user.user
    resp = {
        'id': full_uuid.replace('-', ''),
        'name': user.username,
        'properties': []
    }
    return Response(resp, status=status.HTTP_200_OK)
