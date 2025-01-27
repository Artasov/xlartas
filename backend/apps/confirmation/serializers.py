# confirmation/serializers.py
from adjango.aserializers import ASerializer
from rest_framework.fields import CharField


class NewConfirmationCodeSerializer(ASerializer):
    action = CharField(min_length=2, max_length=30, required=True)
    confirmationMethod = CharField(min_length=2, max_length=30, required=True)  # email or phone
    credential = CharField(min_length=2, max_length=150, required=True)

    new_password = CharField(max_length=100, required=False)
    new_phone = CharField(max_length=100, required=False)
    new_email = CharField(max_length=100, required=False)


class ConfirmConfirmationCodeSerializer(ASerializer):
    code = CharField(min_length=4, max_length=50, required=True)
    credential = CharField(min_length=2, max_length=150, required=True)
    action = CharField(min_length=2, max_length=30, required=True)

    new_password = CharField(max_length=100, required=False)
    new_phone = CharField(max_length=100, required=False)
    new_email = CharField(max_length=100, required=False)
