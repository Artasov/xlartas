from rest_framework import serializers
from .models import TrainerPreset


class TrainerPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerPreset
        fields = '__all__'
