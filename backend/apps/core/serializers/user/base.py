# core/serializers/user/base.py
from adjango.aserializers import ASerializer, AModelSerializer
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import CharField, SerializerMethodField, EmailField, DateField
from rest_framework.relations import SlugRelatedField
from timezone_field.rest_framework import TimeZoneSerializerField

from apps.core.models.user import User, Role


class RoleSerializer(AModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class UserUsernameSerializer(ASerializer):
    username = CharField(min_length=2)


class UserSelfSerializer(AModelSerializer):
    timezone = TimeZoneSerializerField(use_pytz=True)
    is_password_exists = SerializerMethodField()
    roles = SlugRelatedField(many=True, read_only=True, slug_field='name')
    coins = SerializerMethodField()
    full_name = SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username', 'full_name', 'secret_key',
            'email', 'phone', 'avatar', 'roles', 'coins',
            'first_name', 'last_name', 'middle_name',
            'birth_date', 'gender', 'date_joined', 'timezone',
            'is_email_confirmed', 'is_phone_confirmed', 'is_staff',
            'is_password_exists'
        )

    @staticmethod
    def get_full_name(user: User): return user.service.full_name

    @staticmethod
    def get_is_password_exists(user): return bool(user.password) and user.has_usable_password()

    @staticmethod
    def get_coins(user: User) -> float:
        # У модели UserXLMine связь 1 к 1. Если она не создана, вернём 0.
        if hasattr(user, 'userxlmine'):
            return float(user.userxlmine.coins or 0)
        return 0.0


class UserUpdateSerializer(AModelSerializer):
    timezone = TimeZoneSerializerField(use_pytz=True)
    birth_date = DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'middle_name', 'gender',
            'birth_date', 'timezone', 'date_joined'
        )
        read_only_fields = ['date_joined']


class UserAvatarSerializer(AModelSerializer):
    class Meta:
        model = User
        fields = ('avatar',)

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()
        return instance


class UserPublicSerializer(AModelSerializer):
    timezone = TimeZoneSerializerField(use_pytz=True)
    full_name = SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'avatar', 'first_name',
            'last_name', 'middle_name', 'gender', 'timezone'
        )

    @staticmethod
    def get_full_name(user: User): return user.service.full_name


class SignUpSerializer(ASerializer):
    first_name = CharField(required=False, )
    email = EmailField(required=True, )
    phone = PhoneNumberField(required=False)
    timezone = TimeZoneSerializerField(
        use_pytz=True,
        required=False,
        default='Europe/Moscow'
    )

    @staticmethod
    def validate_timezone(value):
        from pytz import timezone as pytz_timezone
        return value if value else pytz_timezone('Europe/Moscow')
