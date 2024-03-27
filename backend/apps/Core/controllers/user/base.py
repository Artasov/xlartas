from adrf.decorators import api_view
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.Core.exceptions.base import CoreExceptions
from apps.Core.exceptions.user import UserExceptions
from apps.Core.messages.success import Responses
from apps.Core.serializers.user.base import UserUsernameSerializer, CurrentUserSerializer
from apps.Core.services.base import acontroller
from apps.Core.services.user.base import is_user_exist


@acontroller('Get current user json info')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def current_user(request) -> Response:
    serializer = CurrentUserSerializer(request.user)
    return Response(await serializer.adata)


@acontroller('Rename current user')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def rename_current_user(request) -> Response:
    serializer = UserUsernameSerializer(data=request.data)
    if serializer.is_valid():
        data = await serializer.adata
        username = data.get('username')
        if username == request.user.username: raise UserExceptions.AlreadyThisUsername()
        if await is_user_exist(username=username): raise UserExceptions.UsernameAlreadyExists()
        request.user.username = username
        await request.user.asave()
        return Responses.Success.RenameCurrentUser
    raise CoreExceptions.SerializerErrors(
        serializer_errors=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )
