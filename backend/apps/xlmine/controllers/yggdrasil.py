# xlmine/controllers/yggdrasil.py
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
    """
    Yggdrasil: POST /authenticate
    Ожидает json, содержащий:
    {
      'username': '<launcher_username>',  # иногда 'agent', 'password' и т.д.
      'password': '<some_password_or_token>',
      'clientToken': '<client_id>',
      'requestUser': true|false
    }
    Возвращаем:
    {
      'accessToken': '<token>',
      'clientToken': '<client_id>',
      'availableProfiles': [...],
      'selectedProfile': {...}
    }
    """
    data = request.data
    log.debug('authenticate payload %s', data)
    username_or_email = data.get('username')
    password = data.get('password')
    client_token = data.get('clientToken', str(uuid.uuid4()))

    # Ищем пользователя:
    user = await User.objects.aby_creds(username_or_email)
    if not user:
        return Response({'error': 'Нет пользователя с таким credential'}, status=status.HTTP_403_FORBIDDEN)

    # Проверяем пароль (либо делаем свою custom-логику)
    # if not user.check_password(password):
    if user.secret_key != password:
        return Response({'error': 'Неверный ключ'}, status=status.HTTP_403_FORBIDDEN)

    from apps.xlmine.models.user import UserXLMine
    xlmine_user, _ = await UserXLMine.objects.aget_or_create(user=user)
    skin_url = get_skin_url(xlmine_user, request)
    # Генерируем 'accessToken' (в реальности можно делать полноценный JWT, но для примера - UUID)
    access_token = str(uuid.uuid4())

    # Допустим, храним в своей модели 'MinecraftSession'
    # чтобы потом по accessToken проверять
    session_obj = MinecraftSession(
        user=user,
        access_token=access_token,
        client_token=client_token,
        created_at=timezone.now()
    )
    await session_obj.asave()

    # Профиль (в Yggdrasil: 'availableProfiles' и 'selectedProfile')
    # Тут, как правило, uuid = <какой-то_уникальный_uuid> от вашего пользователя
    # Можно хранить в user.profile_id или user.id, но Mojang-стиль - это версия-4 UUID
    # Если у вас user.pk - int, сгенерируйте uuid отдельно
    user_uuid = await user.xlmine_uuid()

    selected_profile = {
        'id': user_uuid.replace('-', ''),  # без тире
        'name': user.username
    }

    # Можно вообще отдавать одну availableProfile
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
    """
    Yggdrasil: POST /authserver/refresh
    {
      'accessToken': '...',
      'clientToken': '...',
      'requestUser': true|false
    }
    Возвращаем (аналог authenticate):
    {
      'accessToken': '<new>',
      'clientToken': '...',
      'selectedProfile': {...}
    }
    """
    data = request.data
    log.debug('refresh payload %s', data)
    old_access = data.get('accessToken')
    client_token = data.get('clientToken')

    # Ищем сессию
    try:
        session_obj = await MinecraftSession.objects.aget(
            access_token=old_access,
            client_token=client_token
        )
    except MinecraftSession.DoesNotExist:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    # Генерируем новый токен
    new_access = str(uuid.uuid4())
    session_obj.access_token = new_access
    session_obj.created_at = timezone.now()
    await session_obj.asave()

    user = session_obj.user
    user_uuid = await user.xlmine_uuid()
    selected_profile = {
        'id': user_uuid.replace('-', ''),
        'name': user.username
    }
    from apps.xlmine.models.user import UserXLMine
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
    """
    Yggdrasil: POST /authserver/validate
    {
      'accessToken': '...',
      'clientToken': '...',
    }
    Возвращаем 200, если всё валидно
    Иначе 403
    """
    data = request.data
    access_token = data.get('accessToken')
    client_token = data.get('clientToken')

    # Определяем порог времени жизни сессии
    lifetime = settings.HOURS_MINECRAFT_SESSION_LIFETIME
    threshold = timezone.now() - timedelta(hours=lifetime)

    # Ищем сессию, не старее threshold
    session: MinecraftSession = await MinecraftSession.objects.select_related(
        'user'
    ).filter(
        access_token=access_token,
        client_token=client_token,
        created_at__gte=threshold
    ).afirst()

    if session:
        from apps.xlmine.models.user import UserXLMine
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
    """
    Yggdrasil: POST /authserver/invalidate
    {
      'accessToken': '...',
      'clientToken': '...',
    }
    Считается, что мы удаляем эту сессию
    Возвращаем 204 или 403
    """
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
    """
    Yggdrasil: POST /authserver/signout
    {
      'username': '...',
      'password': '...'
    }
    Логически тоже самое, что invalidate, но без accessToken: мы «разлогиниваем все сессии»?
    """
    data = request.data
    log.debug('signout payload %s', data)
    username_or_email = data.get('username')
    password = data.get('password')

    # Ищем пользователя
    user = await User.objects.aby_creds(username_or_email)
    if not user:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if not user.check_password(password):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    # Удаляем все сессии этого юзера
    await MinecraftSession.objects.filter(user=user).adelete()

    return Response(status=status.HTTP_204_NO_CONTENT)


# ------------------------------------------------------
# SESSION SERVER ENDPOINTS
# ------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
async def join_server_view(request):
    """
    Yggdrasil: POST /session/minecraft/join
    {
      'accessToken': '...',
      'selectedProfile': '...', # UUID без тире
      'serverId': '...',
      # 'serverIP': '...', # необязательно
    }
    Сервер MC вызывает при входе игрока. Мы должны проверить токен и сохранить 'serverId' за этим пользователем
    """
    data = request.data
    log.debug('join payload %s', data)
    access_token = data.get('accessToken')
    profile_id = data.get('selectedProfile')  # uuid без тире
    server_id = data.get('serverId')

    # Ищем сессию
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
    # Сохраняем serverId (например, в поле session_obj)
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
    """
    Yggdrasil: GET /session/minecraft/hasJoined?username=Notch&serverId=xxxx
    Сервер MC пингует, когда к нему пытается зайти игрок. Если у нас есть сессия, мы отдаем:
    {
      'id': '<UUID без тире>',
      'name': 'Notch',
      'properties': [
        {
          'name': 'textures',
          'value': '<base64>',
          'signature': '<если надо>'
        }
      ]
    }
    Иначе 204 или 403
    """
    username = request.GET.get('username')
    server_id = request.GET.get('serverId')

    # Ищем user по имени
    user = await User.objects.aby_creds(username)
    if not user:
        return Response(status=status.HTTP_204_NO_CONTENT)  # user not found => пусто

    # Ищем сессию, где last_server_id = server_id
    # (или как угодно вы у себя сопоставляете)
    try:
        _session_obj = await MinecraftSession.objects.aget(
            user=user,
            last_server_id=server_id
        )
    except MinecraftSession.DoesNotExist:
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Если нашли, значит 'он действительно зашёл'
    user_uuid = await user.xlmine_uuid()
    resp = {
        'id': user_uuid.replace('-', ''),
        'name': user.username,
        'properties': []
    }
    return Response(resp, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
async def profile_view(request, player_uuid):
    """
    Необязательный эндпоинт: GET /session/minecraft/profile/<UUID>
    Выдаёт публичный профиль игрока, например для скинов.
    """
    # Ищем user
    # Здесь player_uuid - это UUID (без тире), поэтому надо привести к нормальному формату
    # Простейший способ - вставить тире вручную или использовать UUID(player_uuid)
    # но нужно быть осторожным, т.к. Mojang иногда UUID без тире
    log.debug('profile request_dict %s', request.__dict__)
    log.debug('profile request_data %s', request.data)
    log.debug('profile query %s', request.GET)
    full_uuid = str(player_uuid)  # Django уже привёл к uuid.UUID формату, если сделали <uuid:player_uuid>
    log.debug('profile_view - player_uuid: %s', full_uuid)

    # Нужно, чтобы user.uuid_for_minecraft() == full_uuid c тире/без тире.
    # Для простоты предположим, что user хранит в поле user.minecraft_uuid
    try:
        xlmine_user = await UserXLMine.objects.select_related('user').aget(uuid=full_uuid)
    except UserXLMine.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    user = xlmine_user.user
    resp = {
        'id': full_uuid.replace('-', ''),
        'name': user.username,
        'properties': []
    }
    return Response(resp, status=status.HTTP_200_OK)
