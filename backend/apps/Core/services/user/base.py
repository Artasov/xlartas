from rest_framework_simplejwt.exceptions import AuthenticationFailed

from apps.Core.models.user import User


async def is_user_exist(**kwargs) -> bool:
    return await User.objects.filter(**kwargs).aexists()


from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Получаем пользователя по email или username
        user = None
        username_or_email = attrs.get('username', None)
        password = attrs.get('password')

        if username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(username=username_or_email)
                except User.DoesNotExist:
                    pass

        if user:
            if not user.check_password(password):
                raise AuthenticationFailed('Wrong password')

            # Аутентификация пользователя
            authenticate(username=user.username, password=password)

            # Возвращаем данные для создания токена
            return super().validate({
                'username': user.username,
                'password': password
            })

        else:
            raise AuthenticationFailed('User is not found')


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
