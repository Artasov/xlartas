# surveys/controllers/surveys.py
from adjango.adecorators import acontroller
from adrf.decorators import api_view
from adrf.generics import aget_object_or_404
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.exceptions.user import UserException
from apps.core.models.user import User
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
    await serializer.ais_valid(raise_exception=True)
    survey = await serializer.asave()
    return Response(await SurveySerializer(survey).adata, status=status.HTTP_201_CREATED)


@acontroller('Update a survey')
@api_view(('PUT',))
@permission_classes((IsAuthenticated,))
async def survey_update(request) -> Response:
    survey_id = request.data.get('survey_id')
    survey = await aget_object_or_404(Survey, id=survey_id)
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    serializer = SurveySerializer(survey, data=request.data, partial=True)
    await serializer.ais_valid(raise_exception=True)
    survey = await serializer.asave()
    return Response(await SurveySerializer(survey).adata, status=status.HTTP_200_OK)


@acontroller('Delete a survey')
@api_view(('DELETE',))
@permission_classes((IsAuthenticated,))
async def survey_delete(request) -> Response:
    survey_id = request.data.get('survey_id')
    survey = await aget_object_or_404(Survey, id=survey_id)
    if await survey.arelated('author') != request.user:
        raise CurrentUserNotSurveyAuthor()
    await survey.adelete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@acontroller('Get survey details by slug')
@api_view(('GET',))
@permission_classes((AllowAny,))
async def get_survey_by_slug(request, slug) -> Response:
    survey = await aget_object_or_404(Survey, slug=slug)
    author = await survey.arelated('author')
    if not survey.is_public:
        if not request.user.is_authenticated:
            raise UserException.NotAuthorized()

        if (author != request.user
                and not await SurveyAccess.objects.filter(
                    survey=survey, user__email=request.user.email
                ).aexists()):
            raise CurrentUserNotSurveyAuthor()
    questions = await Question.objects.afilter(survey=survey)
    questions_data = []
    for question in questions:
        choices = await Choice.objects.afilter(question=question)
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
    surveys = await Survey.objects.afilter(
        Q(is_public=True) |
        Q(author=user) |
        Q(accesses__user=user)
    ).distinct()
    serializer = SurveySerializer(surveys, many=True)
    data = []
    for survey in serializer.data:
        survey['author_name'] = (await User.objects.aget(id=survey['author'])).username
        data.append(survey)
    return Response(data)
