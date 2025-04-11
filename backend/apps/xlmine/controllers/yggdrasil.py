import uuid
from pprint import pprint

from adrf.decorators import api_view
from adrf.requests import AsyncRequest
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models.user import User
from apps.xlmine.models.user import MinecraftSession, UserXLMine


@api_view(['GET'])
@permission_classes([AllowAny])
async def base(request: AsyncRequest):
    pprint(request.__dict__)
    pprint(request.data)
    pprint(request.GET)
    pprint(request.user.__dict__)
    return Response({}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
async def auth_server(request):
    pprint(request.__dict__)
    pprint(request.data)
    pprint(request.GET)
    pprint(request.user.__dict__)
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
      "username": "<launcher_username>",  # иногда "agent", "password" и т.д.
      "password": "<some_password_or_token>",
      "clientToken": "<client_id>",
      "requestUser": true|false
    }
    Возвращаем:
    {
      "accessToken": "<token>",
      "clientToken": "<client_id>",
      "availableProfiles": [...],
      "selectedProfile": {...}
    }
    """
    data = request.data
    pprint(data)
    username_or_email = data.get('username')
    password = data.get('password')
    client_token = data.get('clientToken', str(uuid.uuid4()))

    # Ищем пользователя:
    try:
        if '@' in username_or_email:
            user = await User.objects.aget(email=username_or_email)
        else:
            user = await User.objects.aget(username=username_or_email)
    except User.DoesNotExist:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    # Проверяем пароль (либо делаем свою custom-логику)
    if not user.check_password(password):
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    # Генерируем "accessToken" (в реальности можно делать полноценный JWT, но для примера - UUID)
    access_token = str(uuid.uuid4())

    # Допустим, храним в своей модели "MinecraftSession"
    # чтобы потом по accessToken проверять
    session_obj = MinecraftSession(
        user=user,
        access_token=access_token,
        client_token=client_token,
        created_at=timezone.now()
    )
    await session_obj.asave()

    # Профиль (в Yggdrasil: "availableProfiles" и "selectedProfile")
    # Тут, как правило, uuid = <какой-то_уникальный_uuid> от вашего пользователя
    # Можно хранить в user.profile_id или user.id, но Mojang-стиль - это версия-4 UUID
    # Если у вас user.pk - int, сгенерируйте uuid отдельно
    user_uuid = await user.xlmine_uuid()

    selected_profile = {
        "id": user_uuid.replace("-", ""),  # без тире
        "name": user.username
    }

    # Можно вообще отдавать одну availableProfile
    resp = {
        "accessToken": access_token,
        "clientToken": client_token,
        "availableProfiles": [selected_profile],
        "selectedProfile": selected_profile,
        "user": {
            "id": user_uuid,
            "username": user.username,
            "properties": [
                {
                    "name": "preferredLanguage",
                    "value": "ru"
                }
            ]
        }
    }

    return Response(resp, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
async def refresh_view(request):
    """
    Yggdrasil: POST /authserver/refresh
    {
      "accessToken": "...",
      "clientToken": "...",
      "requestUser": true|false
    }
    Возвращаем (аналог authenticate):
    {
      "accessToken": "<new>",
      "clientToken": "...",
      "selectedProfile": {...}
    }
    """
    data = request.data
    pprint(data)
    old_access = data.get('accessToken')
    client_token = data.get('clientToken')

    # Ищем сессию
    try:
        session_obj = await MinecraftSession.objects.aget(
            access_token=old_access,
            client_token=client_token
        )
    except MinecraftSession.DoesNotExist:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    # Генерируем новый токен
    new_access = str(uuid.uuid4())
    session_obj.access_token = new_access
    session_obj.created_at = timezone.now()
    await session_obj.asave()

    user = session_obj.user
    user_uuid = await user.xlmine_uuid()
    selected_profile = {
        "id": user_uuid.replace("-", ""),
        "name": user.username
    }
    resp = {
        "accessToken": new_access,
        "clientToken": client_token,
        "selectedProfile": selected_profile,
        "user": {
            "id": user_uuid,
            "username": user.username,
            "properties": [
                {
                    "name": "preferredLanguage",
                    "value": "ru"
                }
            ]
        }
    }
    return Response(resp, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
async def validate_view(request):
    """
    Yggdrasil: POST /authserver/validate
    {
      "accessToken": "...",
      "clientToken": "...",
    }
    Возвращаем 204 No Content, если всё валидно
    Иначе 403
    """
    data = request.data
    pprint(data)
    access_token = data.get('accessToken')
    client_token = data.get('clientToken')

    ok = await MinecraftSession.objects.filter(
        access_token=access_token,
        client_token=client_token
    ).aexists()

    if ok:
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([AllowAny])
async def invalidate_view(request):
    """
    Yggdrasil: POST /authserver/invalidate
    {
      "accessToken": "...",
      "clientToken": "...",
    }
    Считается, что мы удаляем эту сессию
    Возвращаем 204 или 403
    """
    data = request.data
    pprint(data)
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
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([AllowAny])
async def signout_view(request):
    """
    Yggdrasil: POST /authserver/signout
    {
      "username": "...",
      "password": "..."
    }
    Логически тоже самое, что invalidate, но без accessToken: мы «разлогиниваем все сессии»?
    """
    data = request.data
    pprint(data)
    username_or_email = data.get('username')
    password = data.get('password')

    # Ищем пользователя
    try:
        if '@' in username_or_email:
            user = await User.objects.aget(email=username_or_email)
        else:
            user = await User.objects.aget(username=username_or_email)
    except User.DoesNotExist:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    if not user.check_password(password):
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

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
      "accessToken": "...",
      "selectedProfile": "...", # UUID без тире
      "serverId": "...",
      # "serverIP": "...", # необязательно
    }
    Сервер MC вызывает при входе игрока. Мы должны проверить токен и сохранить "serverId" за этим пользователем
    """
    data = request.data
    pprint(data)
    access_token = data.get('accessToken')
    profile_id = data.get('selectedProfile')  # uuid без тире
    server_id = data.get('serverId')

    # Ищем сессию
    try:
        session_obj = await MinecraftSession.objects.aget(access_token=access_token)
    except MinecraftSession.DoesNotExist:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    user = session_obj.user
    # Проверяем соответствие profile_id
    if profile_id.lower() != user.uuid_for_minecraft().replace("-", "").lower():
        return Response({"error": "Forbidden profile mismatch"}, status=status.HTTP_403_FORBIDDEN)

    # Сохраняем serverId (например, в поле session_obj)
    session_obj.last_server_id = server_id
    await session_obj.asave()

    return Response({}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
async def has_joined_view(request):
    """
    Yggdrasil: GET /session/minecraft/hasJoined?username=Notch&serverId=xxxx
    Сервер MC пингует, когда к нему пытается зайти игрок. Если у нас есть сессия, мы отдаем:
    {
      "id": "<UUID без тире>",
      "name": "Notch",
      "properties": [
        {
          "name": "textures",
          "value": "<base64>",
          "signature": "<если надо>"
        }
      ]
    }
    Иначе 204 или 403
    """
    username = request.GET.get('username')
    server_id = request.GET.get('serverId')

    # Ищем user по имени
    try:
        user = await User.objects.aget(username=username)
    except User.DoesNotExist:
        return Response(status=status.HTTP_204_NO_CONTENT)  # user not found => пусто

    # Ищем сессию, где last_server_id = server_id
    # (или как угодно вы у себя сопоставляете)
    try:
        session_obj = await MinecraftSession.objects.aget(
            user=user,
            last_server_id=server_id
        )
    except MinecraftSession.DoesNotExist:
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Если нашли, значит "он действительно зашёл"
    user_uuid = await user.xlmine_uuid()
    resp = {
        "id": user_uuid.replace("-", ""),
        "name": user.username,
        # Дополнительно можно отдать скины/кастом-проперти
        "properties": []
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
    pprint(request.__dict__)
    pprint(request.data)
    pprint(request.GET)
    full_uuid = str(player_uuid)  # Django уже привёл к uuid.UUID формату, если сделали <uuid:player_uuid>
    print("profile_view - player_uuid:", full_uuid)

    # Нужно, чтобы user.uuid_for_minecraft() == full_uuid c тире/без тире.
    # Для простоты предположим, что user хранит в поле user.minecraft_uuid
    try:
        xlmine_user = await UserXLMine.objects.select_related('user').aget(uuid=full_uuid)
        user = xlmine_user.user
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    resp = {
        "id": full_uuid.replace("-", ""),
        "name": user.username,
        "properties": []
    }
    return Response(resp, status=status.HTTP_200_OK)
