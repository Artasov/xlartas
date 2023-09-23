from rest_framework import serializers
from .models import TrainerPreset, TrainerPresetResult


class TrainerPresetResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerPresetResult
        fields = ['id', 'user', 'preset', 'right_answer_percentage', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class TrainerPresetSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name')
    user_statistics = serializers.SerializerMethodField()

    class Meta:
        model = TrainerPreset
        fields = '__all__'

    def get_user_statistics(self, obj):
        user = self.context['request'].user
        stats = TrainerPresetResult.objects.filter(preset=obj, user=user)
        return TrainerPresetResultSerializer(stats, many=True).data
