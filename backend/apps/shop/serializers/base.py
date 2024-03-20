from adrf.serializers import Serializer
from rest_framework import serializers


class SubscriptionSerializer(Serializer):
    software_subscription_id = serializers.IntegerField()
