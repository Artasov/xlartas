from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.Core.models import *
from apps.Core.serializers import SignUpSerializer
from apps.Core.services.code_confirmation import (
    get_latest_confirmation_code,
    create_confirmation_code_for_user,
)


@api_view(['POST'])
@permission_classes([AllowAny])
async def signup(request) -> Response:
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        data = await serializer.adata
        username = data['username']
        email = data['email']
        password = data['password']

        username_exists = await User.objects.filter(username=username).aexists()
        if username_exists:
            return Response({"username": ["A user with that username already exists."]},
                            status=status.HTTP_409_CONFLICT)

        email_exists = await User.objects.filter(email=email).aexists()
        if email_exists:
            return Response({"email": ["A user with that email already exists."]},
                            status=status.HTTP_409_CONFLICT)

        user = await sync_to_async(User.objects.create_user, thread_sensitive=True)(
            username=username, email=email, password=password, is_confirmed=False
        )

        code = await create_confirmation_code_for_user(user_id=user.id, code_type=ConfirmationCode.CodeType.signUp)
        if not settings.DEV:
            send_signup_confirmation_email.delay(
                to_email=user.email,
                code=code.code,
                host=request.get_host(),
                is_secure=request.is_secure()
            )

        return Response({'message': 'The user has been created. Please check your email to confirm.'}, status=201)
    else:
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
async def verify_email(request) -> JsonResponse:
    email = request.data.get('email')
    confirmation_code = request.data.get('confirmation_code')

    if not confirmation_code:
        return JsonResponse({'message': 'Confirmation code are required'}, status=400)

    user = await User.objects.filter(email=email).afirst()
    if user is None:
        return JsonResponse({'message': 'User is not found'}, status=404)

    latest_code = await get_latest_confirmation_code(user.id, 'signUp')
    if latest_code is None or latest_code.code != confirmation_code or await latest_code.is_expired():
        return JsonResponse({'message': 'Invalid or outdated confirmation code'}, status=400)

    user.is_confirmed = True
    await user.asave()

    return JsonResponse({'message': 'User verified'})
