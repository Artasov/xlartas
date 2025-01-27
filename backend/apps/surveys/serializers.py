# surveys/serializers.py
from adjango.aserializers import AModelSerializer
from rest_framework import serializers

from apps.surveys.models import (
    Survey, Question, Choice, SurveyAccess,
    SurveyAttempt, QuestionAttempt
)


class ChoiceSerializer(AModelSerializer):
    class Meta:
        model = Choice
        exclude = ('is_correct',)


class ChoiceEditSerializer(AModelSerializer):
    class Meta:
        model = Choice
        fields = '__all__'


class QuestionSerializer(AModelSerializer):
    class Meta:
        model = Question
        exclude = ('correct_text_answer',)


class QuestionEditSerializer(AModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class SurveySerializer(AModelSerializer):
    class Meta:
        model = Survey
        fields = '__all__'


class SurveyAccessSerializer(AModelSerializer):
    class Meta:
        model = SurveyAccess
        fields = '__all__'


class SurveyAttemptSerializer(AModelSerializer):
    class Meta:
        model = SurveyAttempt
        fields = '__all__'


class QuestionAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAttempt
        fields = '__all__'
