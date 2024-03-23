from adrf.decorators import api_view
from adrf.serializers import Serializer
from asgiref.sync import sync_to_async
from rest_framework import serializers
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.Core.confirmations.generators import generate_confirm_code_and_send
from apps.Core.confirmations.manager import CoreConfirmation
from apps.Core.exceptions.base import SomethingGoWrong
from apps.Core.exceptions.user import UserExceptions
from apps.Core.models.user import User
from apps.Core.services.base import acontroller
from apps.confirmation.exceptions.base import UserAlreadyConfirmed
from apps.confirmation.messages.success import Responses
from apps.confirmation.models.base import ActionTypes


@acontroller('Generate confirmation code')
@api_view(('POST',))
@permission_classes([AllowAny])
async def new_confirm_code(request) -> Response:
    class GenerateConfirmationCodeSerializer(Serializer):
        email = serializers.CharField(min_length=2, max_length=30)
        action = serializers.CharField(min_length=2, max_length=30)

    serializer = GenerateConfirmationCodeSerializer(data=request.data)
    if not serializer.is_valid(): raise SomethingGoWrong
    data = await serializer.adata
    email = data.get('email').lower()
    action = data.get('action')

    if not request.user.is_authenticated:
        try:
            request.user = await User.objects.aget(email=email)
        except Exception:
            raise UserExceptions.UserWithThisEmailNotFound()
    if action == ActionTypes.SIGNUP:
        if request.user.is_confirmed:
            raise UserAlreadyConfirmed()
    await generate_confirm_code_and_send(request, action)
    return Responses.Success.ConformationCodeSent


@acontroller('Confirm by code')
@api_view(('POST',))
@permission_classes([AllowAny])
async def confirm_code(request) -> Response:
    print(request.data)
    code_manager = await sync_to_async(CoreConfirmation)(
        code_str=request.data.get('code'), ACTIONS=ActionTypes)
    del request.data['code']
    print(request.data)
    await code_manager.execute(**request.data)
    return Response({'message': 'The code has been successfully verified.'})
