# confirmation/controllers/base.py
import logging

from adjango.adecorators import acontroller
from adjango.utils.base import is_email
from adrf.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from apps.confirmation.exceptions.base import ConfirmationException
from apps.confirmation.messages.success import Responses
from apps.confirmation.models.base import ConfirmationCode
from apps.confirmation.serializers import NewConfirmationCodeSerializer, ConfirmConfirmationCodeSerializer
from apps.confirmation.services.actions import ConfirmationResult
from apps.core.confirmations.actions import CoreConfirmationActionType
from apps.core.exceptions.user import UserException
from apps.core.models import User

log = logging.getLogger('confirmation')


@acontroller('Generate confirmation code')
@api_view(('POST',))
@permission_classes((AllowAny,))
async def new_confirmation_code(request) -> Response:
    serializer = NewConfirmationCodeSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    data = await serializer.avalid_data
    action = data.get('action')
    confirmation_method = data.get('confirmationMethod')
    credential = data.get('credential').lower()
    # Сохраняем почту если она передана.
    if is_email(data.get('new_email', '')):
        request.user.email = data.get('new_email')
        await request.user.asave()

    log.debug(f'Action: {action}')
    await ConfirmationCode.create_and_send(
        request=request,
        action=action,
        method=confirmation_method,
        credential=credential,
        raise_exceptions=True
    )
    return Responses.Success.confirmation_code_sent


@acontroller('Confirm by code')
@api_view(('POST',))
@permission_classes([AllowAny])
async def confirm_code(request) -> Response:
    serializer = ConfirmConfirmationCodeSerializer(data=request.data)
    await serializer.ais_valid(raise_exception=True)
    data = await serializer.avalid_data
    code = data.get('code')
    credential = data.get('credential')
    action = data.get('action')

    if action in (  # Action with authentication and need user from request
            CoreConfirmationActionType.NEW_PHONE,
            CoreConfirmationActionType.NEW_EMAIL,
    ):
        if not request.user.is_authenticated:
            raise UserException.NotAuthorized()
        else:
            user = request.user
    else:
        user = await User.objects.aby_creds(credential)
        if not user: raise UserException.NotFound()

    code_: ConfirmationCode = await ConfirmationCode.objects.agetorn(
        ConfirmationException.Code.NotFound,
        code=code, user=user, action=action
    )

    if str(code_.code) != str(code): raise ConfirmationException.Code.Invalid()

    code_.user = user  # Сейвим юзера чтобы не делать запрос внутри подтверждения кода

    confirmation_data = {}
    if data.get('new_password'): confirmation_data['new_password'] = data.get('new_password')
    # if data.get('new_email'): confirmation_data['new_email'] = data.get('new_email')
    # TODO: Подтверждение почты уже исправил
    #  А с телефоном нужно сделать так же как с почтой чтобы изначально он устанавливался
    #  в поле юзера а кодом подтверждения мы просто устанавливаем is_phone_confirmed)
    if data.get('new_phone'): confirmation_data['new_phone'] = data.get('new_phone')
    result: ConfirmationResult = await code_.confirmation(**confirmation_data)
    return Response(result, HTTP_200_OK)
