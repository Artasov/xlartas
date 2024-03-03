from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

from apps.Core.models import *
from apps.Core.serializers import SignUpSerializer
from apps.Core.services.code_confirmation import (
    get_latest_confirmation_code,
    create_confirmation_code_for_user,
    send_signup_confirmation_email
)


@api_view(['POST'])
@permission_classes([AllowAny])
async def signup(request) -> JsonResponse:
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        data = await serializer.adata
        username = data['username']
        email = data['email']
        password = data['password']

        # После успешной синхронной валидации проводим асинхронные проверки
        username_exists = await User.objects.filter(username=serializer.validated_data['username']).aexists()
        if username_exists:
            return JsonResponse({"username": ["A user with that username already exists."]},
                                status=status.HTTP_400_BAD_REQUEST)

        email_exists = await User.objects.filter(email=serializer.validated_data['email']).aexists()
        if email_exists:
            return JsonResponse({"email": ["A user with that email already exists."]},
                                status=status.HTTP_400_BAD_REQUEST)

        user = await sync_to_async(User.objects.create_user, thread_sensitive=True)(
            username=username, email=email, password=password, is_confirmed=False
        )

        code = await create_confirmation_code_for_user(user_id=user.id, code_type=ConfirmationCode.CodeType.signUp)
        if not settings.DEV:
            send_signup_confirmation_email.delay(request, to_email=user.email, code=code.code)

        return JsonResponse({'message': 'The user has been created. Please check your email to confirm.'}, status=201)
    else:
        return JsonResponse(serializer.errors, status=400)


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
