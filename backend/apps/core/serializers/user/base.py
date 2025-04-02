# core/serializers/user/base.py
from adjango.aserializers import ASerializer, AModelSerializer
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import CharField, SerializerMethodField, EmailField, DateField
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
    roles = RoleSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username', 'full_name', 'secret_key',
            'email', 'phone', 'avatar', 'roles',
            'first_name', 'last_name', 'middle_name',
            'birth_date', 'gender', 'date_joined', 'timezone',
            'is_email_confirmed', 'is_phone_confirmed', 'is_staff',
            'is_password_exists'
        )

    @staticmethod
    def get_is_password_exists(user): return bool(user.password) and user.has_usable_password()


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

    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'avatar', 'first_name',
            'last_name', 'middle_name', 'gender', 'timezone'
        )


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
