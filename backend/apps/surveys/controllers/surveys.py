from adrf.decorators import api_view
from asgiref.sync import sync_to_async
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.Core.async_django import aall, arelated, afilter
from apps.Core.exceptions.base import CoreExceptions
from apps.Core.exceptions.user import UserExceptions
from apps.Core.models.user import User
from apps.Core.services.base import acontroller, aget_object_or_404
from apps.surveys.exceptions.base import CurrentUserNotSurveyAuthor
from apps.surveys.models import Question, Choice
from apps.surveys.models import SurveyAccess, Survey
from apps.surveys.serializers import SurveySerializer, QuestionSerializer, ChoiceSerializer, QuestionEditSerializer, \
    ChoiceEditSerializer


@acontroller('Create a new survey')
@api_view(('POST',))
@permission_classes((IsAuthenticated,))
async def survey_create(request) -> Response:
    request.data['author'] = request.user.id
    serializer = SurveySerializer(data=request.data)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    survey = await serializer.asave()
    return Response(SurveySerializer(survey).data, status=status.HTTP_201_CREATED)


@acontroller('Update a survey')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def survey_update(request) -> Response:
    survey_id = request.data.get('survey_id')
    survey = await aget_object_or_404(Survey, id=survey_id)
    if await arelated(survey, 'author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    serializer = SurveySerializer(survey, data=request.data, partial=True)
    if not await sync_to_async(serializer.is_valid)():
        raise CoreExceptions.SerializerErrors(
            serializer_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    survey = await serializer.asave()
    return Response(SurveySerializer(survey).data, status=status.HTTP_200_OK)


@acontroller('Delete a survey')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def survey_delete(request) -> Response:
    survey_id = request.data.get('survey_id')
    survey = await aget_object_or_404(Survey, id=survey_id)
    if await arelated(survey, 'author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    await survey.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@acontroller('Get survey details by slug')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_survey_by_slug(request, slug) -> Response:
    survey = await aget_object_or_404(Survey, slug=slug)
    author = await arelated(survey, 'author')
    if not survey.is_public:
        if not request.user.is_authenticated:
            raise UserExceptions.NotAuthorized()

        if (author != request.user
                and not await SurveyAccess.objects.filter(
                    survey=survey, user__email=request.user.email
                ).aexists()):
            raise CurrentUserNotSurveyAuthor()
    questions = await afilter(Question.objects, survey=survey)
    questions_data = []
    for question in questions:
        choices = await afilter(Choice.objects, question=question)
        if request.user == author:
            question_data = QuestionEditSerializer(question).data
            question_data['choices'] = ChoiceEditSerializer(choices, many=True).data
        else:
            question_data = QuestionSerializer(question).data
            question_data['choices'] = ChoiceSerializer(choices, many=True).data
        questions_data.append(question_data)
    survey_data = SurveySerializer(survey).data
    survey_data['questions'] = questions_data
    return Response(survey_data)


@acontroller('Get all surveys available to current user')
@api_view(('GET',))
@permission_classes((IsAuthenticated,))
async def get_current_user_surveys(request) -> Response:
    user = request.user
    surveys = await aall(Survey.objects.filter(
        Q(is_public=True) |
        Q(author=user) |
        Q(accesses__user=user)
    ).distinct())
    serializer = SurveySerializer(surveys, many=True)
    data = []
    for survey in serializer.data:
        survey['author_name'] = (await User.objects.aget(id=survey['author'])).username
        data.append(survey)
    return Response(data)
