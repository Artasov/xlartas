from adrf.serializers import ModelSerializer
from rest_framework import serializers

from apps.surveys.models import (
    Survey, Question, Choice, SurveyAccess,
    SurveyAttempt, QuestionAttempt
)


class ChoiceSerializer(ModelSerializer):
    class Meta:
        model = Choice
        exclude = ('is_correct',)


class ChoiceEditSerializer(ModelSerializer):
    class Meta:
        model = Choice
        fields = '__all__'


class QuestionSerializer(ModelSerializer):
    class Meta:
        model = Question
        exclude = ('correct_text_answer',)


class QuestionEditSerializer(ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class SurveySerializer(ModelSerializer):
    class Meta:
        model = Survey
        fields = '__all__'


class SurveyAccessSerializer(ModelSerializer):
    class Meta:
        model = SurveyAccess
        fields = '__all__'


class SurveyAttemptSerializer(ModelSerializer):
    class Meta:
        model = SurveyAttempt
        fields = '__all__'


class QuestionAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAttempt
        fields = '__all__'
